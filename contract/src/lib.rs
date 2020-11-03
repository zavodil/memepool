// To conserve gas, efficient serialization is achieved through Borsh (http://borsh.io/)
use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::wee_alloc;
use near_sdk::{env, near_bindgen, Promise};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

const MIN_DEPOSIT_AMOUNT: u128 = 1_000_000_000_000_000_000_000_000;

#[derive(Debug, Clone, Default, BorshDeserialize, BorshSerialize, Serialize, Deserialize)]
pub struct Idea {
    pub idea_id: u64,  // record id
    pub proposal_id: u64, // proposal_id = 0 for new meme request, otherwise proposal_id = winner_meme.idea_id
    pub title: String,
    pub owner_account_id: String,
    pub description: String,
    pub image: String,
    pub price: u128, // if price > 0 then it is meme request (proposal)
    pub link: String,
    pub vote_count: u32,
    pub total_tips: u128,
}

#[derive(Debug, Clone, Default, BorshDeserialize, BorshSerialize, Serialize, Deserialize)]
pub struct Deposit {
    pub owner_account_id: String,
    pub amount: u128,
}

#[derive(Debug, Clone, Default, BorshDeserialize, BorshSerialize, Serialize, Deserialize)]
pub struct IdeaDeposit {
    pub idea_id: u64,
    pub amount: u128,
}

#[derive(Debug, Clone, Default, BorshDeserialize, BorshSerialize, Serialize, Deserialize)]
pub struct Withdrawal {
    pub owner_account_id: String,
    pub amount_paid: u128,
    pub amount_remaining: u128,
}

type DepositsByIdeas = near_sdk::collections::UnorderedMap<u64, Vec<Deposit>>;
type DepositsByOwners = near_sdk::collections::UnorderedMap<String, Vec<IdeaDeposit>>;
type UserWithdrawals = near_sdk::collections::UnorderedMap<String, Withdrawal>;
type Ideas = near_sdk::collections::UnorderedMap<u64, Idea>;

#[near_bindgen]
#[derive(Default, BorshDeserialize, BorshSerialize)]
pub struct IdeaBankContract {
    deposits_by_ideas: DepositsByIdeas,
    deposits_by_owners: DepositsByOwners,
    user_withdrawals: UserWithdrawals,
    ideas: Ideas,
    max_idea_id: u64,
}

fn add_deposit(
    deposits_by_owners: &mut DepositsByOwners,
    deposits_by_ideas: &mut DepositsByIdeas,
    idea_id: u64,
    account_id: String,
    deposit_amount: u128,
) -> bool {
    match deposits_by_owners.get(&account_id) {
        Some(mut idea_deposit) => {
            idea_deposit.push(IdeaDeposit {
                idea_id: idea_id,
                amount: deposit_amount,
            });
            deposits_by_owners.insert(&account_id, &idea_deposit);
            true
        }
        None => {
            deposits_by_owners.insert(
                &account_id,
                &vec![IdeaDeposit {
                    idea_id: idea_id,
                    amount: deposit_amount,
                }],
            );
            false
        }
    };

    match deposits_by_ideas.get(&idea_id) {
        Some(mut idea) => {
            idea.push(Deposit {
                owner_account_id: account_id,
                amount: deposit_amount,
            });
            deposits_by_ideas.insert(&idea_id, &idea);
            true
        }
        None => {
            deposits_by_ideas.insert(
                &idea_id,
                &vec![Deposit {
                    owner_account_id: account_id,
                    amount: deposit_amount,
                }],
            );
            false
        }
    }
}


fn add_user_withdrawal(
    user_withdrawals: &mut UserWithdrawals,
    account_id: String,
    deposit_amount: u128,
) {
    assert!(
        deposit_amount >= MIN_DEPOSIT_AMOUNT,
        "The amount of deposit is {} and it should be greater or equal to {}",
        deposit_amount,
        MIN_DEPOSIT_AMOUNT
    );

    env::log(format!("Tip @{} with {} yNEAR", account_id, deposit_amount).as_bytes());

    match user_withdrawals.get(&account_id) {
        Some(mut idea_withdrawal) =>
            {
                idea_withdrawal.amount_remaining += deposit_amount;
                env::log(format!("Update @{} withdrawal to {}", account_id, idea_withdrawal.amount_remaining).as_bytes());
                user_withdrawals.insert(&account_id, &idea_withdrawal);
                true
            }
        None => {
            user_withdrawals.insert(
                &account_id,
                &Withdrawal {
                    owner_account_id: account_id.clone(),
                    amount_paid: 0,
                    amount_remaining: deposit_amount,
                },
            );
            env::log(format!("Insert @{} withdrawal", account_id).as_bytes());
            false
        }
    };
}


fn get_user_withdrawal_amount(
    user_withdrawals: &mut UserWithdrawals,
    account_id: String,
) -> u128 {
    match user_withdrawals.get(&account_id) {
        Some(withdrawals) => withdrawals.amount_remaining,
        None => 0,
    }
}

fn withdraw_amount(
    user_withdrawals: &mut UserWithdrawals,
    account_id: String,
    amount: u128,
) {
    match user_withdrawals.get(&account_id) {
        Some(mut withdrawals) => {
            withdrawals.amount_remaining -= amount;
            withdrawals.amount_paid += amount;
            user_withdrawals.insert(&account_id, &withdrawals);
        }
        None => {
            env::log(format!("Withdraw of {} NEAR failed for @{}", amount, account_id).as_bytes());
            //()
        }
    };
}

#[near_bindgen]
impl IdeaBankContract {
    #[init]
    pub fn new() -> Self {
        assert!(!env::state_exists(), "The contract is already initialized");
        Self {
            deposits_by_ideas: near_sdk::collections::UnorderedMap::new(b"d".to_vec()),
            deposits_by_owners: near_sdk::collections::UnorderedMap::new(b"o".to_vec()),
            user_withdrawals: near_sdk::collections::UnorderedMap::new(b"w".to_vec()),
            ideas: near_sdk::collections::UnorderedMap::new(b"i".to_vec()),
            max_idea_id: 0,
        }
    }

    #[payable]
    pub fn create_meme(&mut self, title: String, description: String, image: String, proposal_id: u64, link: String) -> Option<Idea> {
        self.max_idea_id = self.max_idea_id + 1;
        let idea_id: u64 = self.max_idea_id;

        let owner_account_id: String = env::signer_account_id().clone();
        let price: u128 = 0;

        self.ideas.insert(
            &idea_id,
            &Idea {
                idea_id,
                proposal_id,
                title,
                owner_account_id,
                description,
                image,
                price,
                link,
                vote_count: 0,
                total_tips: price,
            },
        );

        match self.ideas.get(&idea_id) {
            Some(idea) => Some(idea),
            None => None,
        }
    }

    #[payable]
    pub fn create_idea(&mut self, title: String, description: String, image: String, link: String) -> Option<Idea> {
        self.max_idea_id = self.max_idea_id + 1;
        let idea_id = self.max_idea_id;

        let owner_account_id: String = env::signer_account_id();
        let price = near_sdk::env::attached_deposit();
        let proposal_id: u64 = 0;

        self.ideas.insert(
            &idea_id,
            &Idea {
                idea_id,
                proposal_id,
                title,
                owner_account_id: owner_account_id.clone(),
                description,
                image,
                price,
                link,
                vote_count: 0,
                total_tips: price,
            },
        );

        add_deposit(
            &mut self.deposits_by_owners,
            &mut self.deposits_by_ideas,
            idea_id,
            owner_account_id,
            price,
        );

        match self.ideas.get(&idea_id) {
            Some(idea) => Some(idea),
            None => None,
        }
    }

    #[payable]
    pub fn tip_meme(&mut self, idea_id: u64) -> bool {
        let deposit_sender_amount = env::attached_deposit();
        let sender_account_id: String = env::signer_account_id();
        assert!(
            deposit_sender_amount >= MIN_DEPOSIT_AMOUNT,
            "The amount of deposit is {} and it should be greater or equal to {}",
            deposit_sender_amount,
            MIN_DEPOSIT_AMOUNT
        );

        match self.ideas.get(&idea_id) {
            Some(mut idea) => {
                idea.total_tips += deposit_sender_amount;
                idea.vote_count += 1;
                self.ideas.insert(&idea_id, &idea);

                env::log(format!("Tip @{} with {} yNEAR for meme {}", idea.owner_account_id, deposit_sender_amount, idea_id).as_bytes());

                add_user_withdrawal(&mut self.user_withdrawals, idea.owner_account_id,
                                    deposit_sender_amount);

                add_deposit(
                    &mut self.deposits_by_owners,
                    &mut self.deposits_by_ideas,
                    idea_id,
                    sender_account_id,
                    deposit_sender_amount,
                );
                true
            }
            None => {
                false
            }
        }
    }

    pub fn upvote_idea(&mut self, idea_id: u64) -> bool {
        let deposit_sender_amount: u128 = env::attached_deposit();
        let sender_account_id: String = env::signer_account_id();
        assert!(
            deposit_sender_amount >= MIN_DEPOSIT_AMOUNT,
            "The amount of deposit is {} and it should be greater than equal to {}",
            deposit_sender_amount,
            MIN_DEPOSIT_AMOUNT
        );

        match self.ideas.get(&idea_id) {
            Some(mut idea) => {
                idea.vote_count += 1;
                idea.total_tips += deposit_sender_amount;
                add_deposit(
                    &mut self.deposits_by_owners,
                    &mut self.deposits_by_ideas,
                    idea_id,
                    sender_account_id,
                    deposit_sender_amount,
                );
                true
            }
            None => {
                false
            }
        }
    }

    pub fn get_num_ideas(&self) -> u64 {
        self.max_idea_id
    }

    pub fn get_all_ideas(&self) -> HashMap<u64, Idea> {
        self.ideas.iter().collect()
    }

    pub fn get_idea_by_id(&self, id: u64) -> Option<Idea> {
        match self.ideas.get(&id) {
            Some(idea) => Some(idea),
            None => None,
        }
    }

    pub fn get_all_withdrawals(&self) -> HashMap<String, Withdrawal> {
        self.user_withdrawals.iter().collect()
    }

    pub fn get_all_user_deposits(&self) -> HashMap<String, Vec<IdeaDeposit>> {
        self.deposits_by_owners.iter().collect()
    }

    pub fn get_all_idea_deposits(&self) -> HashMap<u64, Vec<Deposit>> {
        self.deposits_by_ideas.iter().collect()
    }

    pub fn get_withdrawals_by_user(&self, account_id: String) -> Option<Withdrawal> {
        match self.user_withdrawals.get(&account_id) {
            Some(withdrawal) => Some(withdrawal),
            None => None,
        }
    }

    pub fn get_deposits_by_idea(&self, idea_id: u64) -> Option<Vec<Deposit>> {
        match self.deposits_by_ideas.get(&idea_id) {
            Some(ideas) => Some(ideas.to_vec()),
            None => None,
        }
    }

    pub fn get_deposits_by_owner(&self, account_id: String) -> Option<Vec<IdeaDeposit>> {
        match self.deposits_by_owners.get(&account_id) {
            Some(deposit) => Some(deposit),
            None => None,
        }
    }

    pub fn choose_winner(&mut self, idea_id: u64, proposal_id: u64) -> bool {
        let sender_account_id: String = env::signer_account_id();

        match self.ideas.get(&proposal_id) {
            Some(mut proposal) => {
                assert!(
                    proposal.owner_account_id == sender_account_id,
                    "You tried to updated proposal of {} with account of {}",
                    proposal.owner_account_id,
                    sender_account_id
                );

                assert!(proposal.proposal_id == 0, "Proposal already has selected winner");

                let proposal_price = proposal.price;
                proposal.proposal_id = idea_id;

                self.ideas.insert(&proposal_id, &proposal);

                match self.ideas.get(&idea_id) {
                    Some(mut idea) => {
                        idea.total_tips += proposal_price;
                        idea.vote_count += 1;

                        add_user_withdrawal(&mut self.user_withdrawals, idea.owner_account_id,
                                            proposal_price);

                        env::log(
                            format!(
                                "@{} choose winner {} for {}",
                                sender_account_id, idea_id, proposal_id
                            )
                                .as_bytes(),
                        );
                        true
                    }
                    None => {
                        false
                    }
                }
            }
            None => {
                false
            }
        }
    }

    pub fn withdraw(&mut self, amount: near_sdk::json_types::U128) {
        let amount: u128 = amount.into();
        assert!(amount > 0, "Withdrawal amount should be positive");

        let account_id = env::predecessor_account_id();

        let user_withdraw_amount_remaining = get_user_withdrawal_amount(&mut self.user_withdrawals, account_id.clone());

        assert!(
            user_withdraw_amount_remaining >= amount,
            "Not enough balance to withdraw"
        );

        withdraw_amount(&mut self.user_withdrawals, account_id.clone(),
                        amount);

        env::log(
            format!(
                "@{} withdrawing {}",
                account_id, amount
            )
                .as_bytes(),
        );

        Promise::new(account_id).transfer(amount);
    }
}

/*
 * The rest of this file holds the inline tests for the code above
 * Learn more about Rust tests: https://doc.rust-lang.org/book/ch11-01-writing-tests.html
 *
 * To run from contract directory:
 * cargo test -- --nocapture
 *
 * From project root, to run in combination with frontend tests:
 * yarn test
 *
 */
#[cfg(test)]
mod tests {
    use super::*;
    use near_sdk::MockedBlockchain;
    use near_sdk::{testing_env, AccountId, VMContext};

    fn alice() -> AccountId {
        "alice".to_string()
    }

    fn bob() -> AccountId {
        "bob".to_string()
    }

    fn eve() -> AccountId {
        "eve".to_string()
    }

    // mock the context for testing, notice "signer_account_id" that was accessed above from env::
    fn get_context(signer_account_id: AccountId, deposit_amount: u128) -> VMContext {
        VMContext {
            current_account_id: "owner".to_string(),
            signer_account_id,
            signer_account_pk: vec![0, 1, 2],
            predecessor_account_id: "previous_owner".to_string(),
            input: vec![],
            block_index: 0,
            block_timestamp: 0,
            account_balance: 0,
            account_locked_balance: 0,
            storage_usage: 0,
            attached_deposit: deposit_amount,
            is_view: false,
            prepaid_gas: 10u64.pow(18),
            random_seed: vec![0, 1, 2],
            output_data_receivers: vec![],
            epoch_height: 19,
        }
    }

    #[test]
    fn alice_can_create_idea() {
        /*
                let context = get_context(alice(), MIN_DEPOSIT_AMOUNT);
                testing_env!(context);

                let mut contract = IdeaBankContract::default();
                let title = "Near Kitties".to_string();
                let link = "http://www.cryptokitties.co/".to_string();

                let idea: Idea = contract.create_idea(title.clone(), link.clone()).unwrap();

                assert_eq!(title, idea.title);
                assert_eq!(link, idea.link);
                assert_eq!(contract.ideas.len(), 1);*/
    }

    #[test]
    fn eve_can_vote_bob_idea() {
        /*
                let context = get_context(eve(), MIN_DEPOSIT_AMOUNT);
                testing_env!(context);

                let mut contract = IdeaBankContract::default();
                let title = "A gambling gaming platform".to_string();
                let link = "https://www.247freepoker.com/".to_string();

                contract.ideas.insert(
                    1,
                    Idea {
                        idea_id: 1,
                        title,
                        link,
                        vote_count: 0,
                        owner_account_id: bob().clone(),
                    },
                );

                let idea = contract.upvote_idea(1);
                assert_eq!(idea.vote_count, 1);
                assert_eq!(
                    contract.deposits_by_owners.get(&eve()).unwrap().amount,
                    MIN_DEPOSIT_AMOUNT
                );
                assert_eq!(contract.deposits_by_ideas.get(&1).unwrap().len(), 1);
                assert_eq!(
                    contract.deposits_by_ideas.get(&1).unwrap()[0].amount,
                    MIN_DEPOSIT_AMOUNT
                );
                assert_eq!(
                    contract.deposits_by_ideas.get(&1).unwrap()[0].owner_account_id,
                    eve()
                );
                */
    }
}

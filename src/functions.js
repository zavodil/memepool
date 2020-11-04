import {utils} from 'near-api-js'

const FRAC_DIGITS = 5
class Common {
    static formatNearAmount(amount) {
        if (!amount)
            return 0;

        amount = Common.toFixed(amount);
        let ret = utils.format.formatNearAmount(amount.toString(), FRAC_DIGITS);

        if (amount === '0') {
            return amount;
        } else if (ret === '0') {
            return `<${!FRAC_DIGITS ? `0` : `0.${'0'.repeat((FRAC_DIGITS || 1) - 1)}1`}`;
        }
        return ret;
    }

    static toFixed(x) {
        if (Math.abs(x) < 1.0) {
            let e = parseInt(x.toString().split('e-')[1]);
            if (e) {
                x *= Math.pow(10, e - 1);
                x = '0.' + (new Array(e)).join('0') + x.toString().substring(2);
            }
        } else {
            let e = parseInt(x.toString().split('+')[1]);
            if (e > 20) {
                e -= 20;
                x /= Math.pow(10, e);
                x += (new Array(e + 1)).join('0');
            }
        }
        return x;
    }

    static GetIdeaAdvancedFields(idea, ideas){
        console.log("GetIdeaAdvancedFields")
        console.log(ideas)
        console.log(idea)
        idea.price = Common.formatNearAmount(idea.price);
        idea.total_tips = Common.formatNearAmount(idea.total_tips);
        if (!idea.price && idea.proposal_id) {
            idea.proposal_owner_account_id = ideas[idea.proposal_id].owner_account_id;
            idea.proposal_winner_chosen = !!ideas[idea.proposal_id].proposal_id;
            idea.is_proposal_winner = ideas[idea.proposal_id].proposal_id === idea.idea_id;
            idea.proposal_price = ideas[idea.proposal_id].price || 0;
            idea.proposal_title = ideas[idea.proposal_id].title || "";
        }

        if (idea.price && ideas.hasOwnProperty(idea.proposal_id)) {
            idea.proposal_winner_title = ideas[idea.proposal_id].title || "";
            idea.proposal_winner_id = ideas[idea.proposal_id].idea_id || 0;
        }
        return idea;
    }
}
export default Common;
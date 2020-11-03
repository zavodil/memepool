import React from 'react';


const UserDeposits = ({user_deposits}) => (
        <TableContainer component={Paper}>
            <Table aria-label="simple table">
                <TableHead>
                    <TableRow>
                        <TableCell>User</TableCell>
                        <TableCell align="right">Amount</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {user_deposits.map((row) => (
                        <TableRow key={row.account_id}>
                            <TableCell component="th" scope="row">
                                {row.account_id}
                            </TableCell>
                            <TableCell align="right">{row.amount}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
);

export default UserDeposits;


/*

import React from "react";
import {Card} from "react-bootstrap";

const Withdrawal = ({withdrawal}) => (
    <Card className='bg-gray-400 px-4 flex'>
        <div className='flex w-1/2 p-5'>Author: {withdrawal.owner_account_id}</div>
        <div className='flex w-1/2 p-5'>Total Tips: {withdrawal.amount}</div>
    </Card>
);

export default Withdrawal;
*/

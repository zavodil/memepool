import React from 'react';


const Withdrawal = ({withdrawals}) => (
        <TableContainer component={Paper}>
            <Table aria-label="simple table">
                <TableHead>
                    <TableRow>
                        <TableCell>User</TableCell>
                        <TableCell align="right">Paid Amount</TableCell>
                        <TableCell align="right">Remaining Amount</TableCell>
                        <TableCell align="right">Total Amount</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {withdrawals.map((row) => (
                        <TableRow key={row.owner_account_id}>
                            <TableCell component="th" scope="row">
                                {row.owner_account_id}
                            </TableCell>
                            <TableCell align="right">{row.amount_paid}</TableCell>
                            <TableCell align="right">{row.amount_remaining}</TableCell>
                            <TableCell align="right">{row.total}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
);

export default Withdrawal;


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

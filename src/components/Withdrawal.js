import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import {APP_PATH} from "../constants";
import {Link} from "react-router-dom";

const Withdrawal = ({withdrawals}) => (
    <div className='form-container flex flex-col'>
        <div className='flex py-2 px-2 my-6'>
            <div className='w-1/6 flex mb-auto align-top'>
                <div className='near-btn'>
                    <Link to={APP_PATH}>Back</Link>
                </div>
            </div>
        <TableContainer component={Paper} className='withdrawals-table'>
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
        </div>
    </div>
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
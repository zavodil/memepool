import React from "react";
import {Card} from "react-bootstrap";

const Idea = ({idea, tipMeme}) => (
    <Card className='bg-gray-400 px-4 flex'>
        <div className='flex w-1/5 p-8 font-bold'>{idea.title}</div>
        <div className='flex w-1/5 p-5'><img src={idea.image} className='meme'/></div>
        <div className='flex w-1/10 p-5'>Author: {idea.owner_account_id}</div>
        <div className='flex w-1/10 p-5'><a href={idea.link}>Details</a></div>
        <div className='flex w-1/10 p-5'>Tags: {idea.description}</div>
        <div className='flex w-1/10 p-5'>Tips: {idea.total_tips} NEAR ({idea.vote_count})</div>
        <div className='flex w-1/10 p-5'>
            <button className='w-7 p-2 near-btn mb-auto align-top' onClick={() => tipMeme(idea, 1, idea.owner_account_id)}>
                Tip 1 NEAR
            </button>
        </div>
    </Card>
);

export default Idea;

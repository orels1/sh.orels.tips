'use client';
import { TwitterTweetEmbed } from "react-twitter-embed";

export default function Tweet({ tweetId }: { tweetId: string }) {
  return (
    <div className="w-full">
      <div className="m-auto">
        <TwitterTweetEmbed tweetId={tweetId} />
      </div>
    </div>
  );
}

import Post from "./Post";
import PostSkeleton from "../skeletons/PostSkeleton";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import { useEffect } from "react";
import { apiRequest } from "../../utils/api";
const Posts = ({ feedType, username, userId }) => {

  const getPostEndpoint = () => {
    switch (feedType) {
      case "forYou":
        return "/api/posts/all";
      case "following":
        return "/api/posts/following";
      case "posts":
        return `/api/posts/user/${username}`;
      case "liked":
        return `/api/posts/likes/${userId}`;
      default:
        return "/api/posts/all";
    }
  };

  const POST_ENDPOINT = getPostEndpoint();

  const {
    data: posts,
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["posts"],
    queryFn: async () => {
      return await apiRequest(POST_ENDPOINT);
    },
  });

  useEffect(() => {
    refetch();
  }, [feedType, refetch, username, userId]);

  return (
    <>
      {(isLoading || isRefetching) && (
        <div className="flex flex-col justify-center">
          <PostSkeleton />
          <PostSkeleton />
          <PostSkeleton />
        </div>
      )}
      {(!isLoading || !isRefetching) && posts?.length === 0 && (
        <p className="text-center my-4">No posts in this tab. Switch 👻</p>
      )}
      {(!isLoading || !isRefetching) && posts?.length > 0 && (
        <div>
          {posts.map((post, index) => (
            <Post key={post._id} post={post} index={index} />
          ))}
        </div>
      )}
    </>
  );
};
export default Posts;

import T from "../svgs/T";
import { useState } from "react";
import { MdHomeFilled } from "react-icons/md";
import { IoNotifications } from "react-icons/io5";
import { FaUser } from "react-icons/fa";
import { Link } from "react-router-dom";
import { BiLogOut } from "react-icons/bi";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { apiRequest } from "../../utils/api.js";

const Sidebar = () => {
  const [selected, setSelected] = useState("home");
  const queryClient = useQueryClient();
  const { mutate } = useMutation({
    mutationFn: async () => {
      return await apiRequest("/api/auth/logout", "POST");
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },

    onError: () => {
      toast.error("Failed to logout user");
    },
  });
  const { data: authUser } = useQuery({ queryKey: ["authUser"] });

  return (
    <div className="md:flex-[2_2_1] w-18 max-w-48">
      <div className="sticky top-0 left-0 h-screen flex flex-col border-r border-gray-700 w-20 lg:w-full">
        <Link to="/" className="flex justify-center">
          <T className="px-2 w-12 h-12 rounded-full fill-white" />
        </Link>
        <ul className="flex flex-col gap-3 mt-4">
          <li className="flex justify-center md:justify-start">
            <Link
              to="/"
              onClick={() => setSelected("home")}
              className={`flex gap-3 items-center transition-all md:rounded-l-full  duration-300 py-2 pl-5 pr-4 w-full cursor-pointer ${
                selected === "home" ? "bg-stone-800" : ""
              }`}
            >
              <MdHomeFilled className="w-8 h-8" />
              <span className="text-lg hidden lg:block">Home</span>
            </Link>
          </li>
          <li className="flex justify-center md:justify-start">
            <Link
              to="/notifications"
              onClick={() => setSelected("notifications")}
              className={`flex gap-3 items-center transition-all md:rounded-l-full duration-300 py-2 pl-6 pr-4 w-full cursor-pointer ${
                selected === "notifications" ? "bg-stone-800" : ""
              }`}
            >
              <IoNotifications className="w-6 h-6" />
              <span className="text-lg hidden lg:block">Notifications</span>
            </Link>
          </li>

          <li className="flex justify-center md:justify-start">
            <Link
              onClick={() => setSelected("profile")}
              to={`/profile/${authUser?.username}`}
              className={`flex gap-3 items-center transition-all md:rounded-l-full  duration-300 py-2 pl-6 pr-4 w-full cursor-pointer ${
                selected === "profile" ? "bg-stone-800" : ""
              }`}
            >
              <FaUser className="w-6 h-6" />
              <span className="text-lg hidden lg:block">Profile</span>
            </Link>
          </li>
        </ul>
        {authUser && (
          <Link
            to={`/profile/${authUser.username}`}
            className="mt-auto mb-10 flex gap-2 items-start transition-all duration-300 hover:bg-[#181818] py-2 px-4 rounded-full"
          >
            <div className="avatar hidden lg:inline-flex">
              <div className="w-8 rounded-full">
                <img
                  src={authUser?.profileImage || "/avatar-placeholder.png"}
                />
              </div>
            </div>
            <div className="flex justify-between flex-1 mr-2">
              <div className="hidden lg:block">
                <p className="text-white font-bold text-sm w-20 truncate">
                  {authUser?.fullName}
                </p>
                <p className="text-slate-500 text-sm">@{authUser?.username}</p>
              </div>
              <BiLogOut
                className="w-5 h-5 ml-3 mt-2 cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  mutate();
                }}
              />
            </div>
          </Link>
        )}
      </div>
    </div>
  );
};
export default Sidebar;

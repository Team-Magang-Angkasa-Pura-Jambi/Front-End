"use client";

import React from "react";
import { User, Lock } from "lucide-react";
import { Bubble } from "./Bubble";
import { LoginIllustration } from "./LoginIllustration";
import { LeftSide } from "./LeftSide";
import { RightSide } from "./RightSide";

export const Page = () => {
  return (
    <div className="min-h-screen bg-[#d6d3d1]  flex items-center justify-center p-4">
      <div
        className="w-full relatve max-w-6xl flex flex-col md:flex-row rounded-2xl shadow-2xl overflow-hidden bg-white relative"
        style={{ minHeight: "650px" }}
      >
        <svg
          className="absolute  rotate-[125deg] z-10 top-[280px] -left-[410px] "
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 320"
        >
          <path
            fill="#fff"
            fillOpacity={1}
            d="M0,32L40,74.7C80,117,160,203,240,224C320,245,400,203,480,165.3C560,128,640,96,720,106.7C800,117,880,171,960,165.3C1040,160,1120,96,1200,85.3C1280,75,1360,117,1400,138.7L1440,160L1440,320L1400,320C1360,320,1280,320,1200,320C1120,320,1040,320,960,320C880,320,800,320,720,320C640,320,560,320,480,320C400,320,320,320,240,320C160,320,80,320,40,320L0,320Z"
          ></path>
        </svg>

        <LeftSide />

        <RightSide />

        <div className="hidden md:block z-20">
          <Bubble size={80} delay={0.2} style={{ top: "15%", left: "78%" }} />
          <Bubble size={40} delay={1.5} style={{ top: "30%", left: "54%" }} />
          <Bubble size={25} delay={0.8} style={{ top: "50%", left: "76%" }} />
          <Bubble size={60} delay={2} style={{ top: "65%", left: "52%" }} />
          <Bubble size={30} delay={3} style={{ bottom: "15%", left: "77%" }} />
          <Bubble size={50} delay={3.5} style={{ bottom: "5%", left: "55%" }} />
          {/* Tambahan bubbles untuk efek lebih ramai */}
          <Bubble size={20} delay={0.5} style={{ top: "5%", left: "51%" }} />
          <Bubble size={35} delay={2.5} style={{ top: "80%", left: "49%" }} />
          <Bubble size={45} delay={1.2} style={{ top: "90%", left: "83%" }} />
          <Bubble size={15} delay={4.0} style={{ top: "40%", left: "49%" }} />
        </div>
      </div>
    </div>
  );
};

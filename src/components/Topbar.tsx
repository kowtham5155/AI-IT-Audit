import React from 'react';
import { Search, Bell, Network, User } from 'lucide-react';

interface TopbarProps {
  title: string;
  user: { name: string; role: string };
}

export default function Topbar({ title, user }: TopbarProps) {
  return (
    <header className="fixed top-0 right-0 left-64 h-16 flex justify-between items-center px-10 z-40 bg-white/80 backdrop-blur-xl shadow-sm">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-bold text-on-surface font-headline">{title}</h2>
        <div className="h-4 w-[1px] bg-outline-variant/30 mx-2 hidden md:block"></div>
        <span className="text-xs font-semibold text-tertiary flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse"></span>
          System Status: Active
        </span>
      </div>

      <div className="flex items-center gap-6">
        <div className="hidden lg:flex items-center bg-surface-container px-3 py-1.5 rounded-lg">
          <Search size={16} className="text-on-surface-variant mr-2" />
          <input 
            type="text" 
            placeholder="Search system assets..." 
            className="bg-transparent border-none focus:ring-0 text-sm w-64 text-on-surface placeholder:text-on-surface-variant/50"
          />
        </div>

        <div className="flex items-center gap-4 text-on-surface-variant">
          <button className="hover:text-primary transition-all relative">
            <Network size={20} />
          </button>
          <button className="hover:text-primary transition-all relative">
            <Bell size={20} />
            <span className="absolute top-0 right-0 w-2 h-2 bg-error rounded-full border-2 border-white"></span>
          </button>
        </div>

        <div className="h-8 w-px bg-outline-variant/30"></div>

        <div className="flex items-center gap-3 pl-4">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold leading-none">{user.name}</p>
            <p className="text-[10px] text-on-surface-variant">{user.role}</p>
          </div>
          <div className="w-8 h-8 rounded-lg overflow-hidden bg-surface-container">
            <img 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuD00lNaP835XTD7AKtuMBMASpBDCQxOcMbCfpVR3Uz7dB5RixRTciShyGUENyyFUKQKV3m0jyS7l75F9kypEaP15BT7Lrvw0rWQI9iqsmgtSW_kFERMp9pR2yPfhKh5xddMjO_o-aZ0WbWvf7RO_h3RPGxVPBeSttMMsOTQ3VEnu_6eBMAVrbN4jeZlB8JIiisd1Uq34qPRNSJexH4sOa3G-3VdQ1uuYKYV_ziHw-A6E8VGb4naPCyvZqSgqdIkXXLmON_5UvYJ1A" 
              alt="User" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </div>
    </header>
  );
}

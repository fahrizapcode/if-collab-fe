"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { usersService } from "@/lib/services/users.service";

interface UserAvatarProps {
    userId: string;
    userName: string;
    hasAvatar?: boolean;
    size?: number;
    className?: string;
}

export default function UserAvatar({
    userId,
    userName,
    hasAvatar = false,
    size = 40,
    className = "",
}: UserAvatarProps) {
    const src = hasAvatar
        ? usersService.getAvatarUrl(userId)
        : "/images/default.png";

    const [error, setError] = useState(false);

    const handleError = () => {
        setError(true);
    };

    const finalSrc = error ? "/images/default.png" : src;

    return (
        <div
            className={`relative overflow-hidden rounded-full border border-gray-100 aspect-square ${className}`}
            style={{ width: size, height: size }}
        >
            <Image
                src={finalSrc}
                alt={userName}
                fill
                sizes={`${size}px`}
                onError={handleError}
                unoptimized={hasAvatar}
                className="object-cover"
            />
        </div>
    );
}

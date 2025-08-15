"use client"

import Link from "next/link"
import Image from "next/image"
import { ChevronDown } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

export function ClientHeaderBrandDropdown() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center text-sm font-medium hover:text-blue-600 transition-colors">
        Brands <ChevronDown className="ml-1 h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 z-[100]">
        <DropdownMenuItem asChild>
          <Link href="/brand/borosil" className="flex items-center">
            <Image src="/images/logo-borosil.png" alt="Borosil" width={20} height={20} className="mr-2" />
            Borosil
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/brand/whatman" className="flex items-center">
            <Image src="/images/logo-whatman.png" alt="Whatman" width={20} height={20} className="mr-2" />
            Whatman
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/brand/qualigens" className="flex items-center">
            <Image src="/images/logo-qualigens.png" alt="Qualigens" width={20} height={20} className="mr-2" />
            Qualigens
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/brand/avarice" className="flex items-center">
            <Image src="/images/logo-avarice.png" alt="Avarice" width={20} height={20} className="mr-2" />
            Avarice
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/brand/rankem" className="flex items-center">
            <Image src="/images/logo-rankem.png" alt="Rankem" width={20} height={20} className="mr-2" />
            Rankem
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/brand/HiMedia" className="flex items-center">
            <Image src="/images/logo-himedia.png" alt="HiMedia" width={20} height={20} className="mr-2" />
            HiMedia
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/brand/omsons" className="flex items-center">
            <Image src="/images/brands/omsons/logo.png" alt="Omsons Glassware" width={20} height={20} className="mr-2" />
            Omsons Glassware
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/products/laboratory-supplies" className="text-blue-600 font-medium">
            All Laboratory Supplies →
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

'use client';

import { ChevronRight, type LucideIcon } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar';

type NavSubItem = {
  title: string;
  url: string;
};

type NavItem = {
  title: string;
  url: string;
  icon?: LucideIcon;
  items?: NavSubItem[];
};

type NavGroup = {
  label?: string;
  items: NavItem[];
};

function NavGroupSection({
  group,
  pathname,
  openItems,
  onToggle,
}: {
  group: NavGroup;
  pathname: string;
  openItems: Set<string>;
  onToggle: (title: string, isOpen: boolean) => void;
}) {
  const router = useRouter();
  return (
    <SidebarGroup>
      {group.label && <SidebarGroupLabel>{group.label}</SidebarGroupLabel>}
      <SidebarMenu>
        {group.items.map((item) => {
          const hasSubItems = item.items && item.items.length > 0;
          const itemBase = `/${item.url.split('/').filter(Boolean)[0] || ''}`;
          const isActive =
            item.url === pathname ||
            item.items?.some((sub) => sub.url === pathname) ||
            (itemBase.length > 1 && pathname.startsWith(`${itemBase}/`));

          if (!hasSubItems) {
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  tooltip={item.title}
                  isActive={isActive}
                  onClick={() => router.push(item.url)}
                  className="cursor-pointer"
                >
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          }

          return (
            <SidebarMenuItem key={item.title}>
              <Collapsible
                open={openItems.has(item.title)}
                onOpenChange={(isOpen) => onToggle(item.title, isOpen)}
                className="group/collapsible w-full"
              >
                <CollapsibleTrigger
                  render={
                    <SidebarMenuButton
                      tooltip={item.title}
                      isActive={isActive}
                      className="cursor-pointer"
                    />
                  }
                >
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                  <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items?.map((subItem) => (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton
                          isActive={subItem.url === pathname}
                          onClick={() => router.push(subItem.url)}
                          className="cursor-pointer"
                        >
                          <span>{subItem.title}</span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </Collapsible>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}

export function NavMain({ groups }: { groups: NavGroup[] }) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

  const getInitialOpenItems = useCallback(() => {
    const open = new Set<string>();
    for (const group of groups) {
      for (const item of group.items) {
        if (item.items?.some((sub) => sub.url === pathname)) {
          open.add(item.title);
        }
      }
    }
    return open;
  }, [groups, pathname]);

  useEffect(() => {
    setMounted(true);
    setOpenItems(getInitialOpenItems());
  }, [getInitialOpenItems]);

  const handleToggle = (title: string, isOpen: boolean) => {
    setOpenItems((prev) => {
      const next = new Set(prev);
      if (isOpen) {
        next.add(title);
      } else {
        next.delete(title);
      }
      return next;
    });
  };

  if (!mounted) {
    return (
      <>
        {groups.map((group, i) => (
          <SidebarGroup key={group.label ?? i}>
            {group.label && <SidebarGroupLabel>{group.label}</SidebarGroupLabel>}
            <SidebarMenu>
              {group.items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton tooltip={item.title}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </>
    );
  }

  return (
    <>
      {groups.map((group, i) => (
        <NavGroupSection
          key={group.label ?? i}
          group={group}
          pathname={pathname}
          openItems={openItems}
          onToggle={handleToggle}
        />
      ))}
    </>
  );
}

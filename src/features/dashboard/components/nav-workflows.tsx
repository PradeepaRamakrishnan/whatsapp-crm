'use client';

import { ChevronRight, type LucideIcon } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  SidebarGroup,
  // SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar';

export function NavWorkflows({
  workflows,
}: {
  workflows: {
    name: string;
    url: string;
    icon: LucideIcon;
    items?: {
      title: string;
      url: string;
    }[];
  }[];
}) {
  const pathname = usePathname();

  // Find which workflow contains the active path
  const getActiveWorkflow = useCallback(() => {
    return (
      workflows.find((w) => w.url === pathname || w.items?.some((item) => item.url === pathname))
        ?.name || null
    );
  }, [workflows, pathname]);

  // Always start null (closed) on the server to prevent aria-controls hydration mismatch.
  // The useEffect below sets the correct open item after client hydration.
  const [openWorkflow, setOpenWorkflow] = useState<string | null>(null);

  // Update open workflow when pathname changes (client-only)
  useEffect(() => {
    const activeWorkflow = getActiveWorkflow();
    setOpenWorkflow(activeWorkflow);
  }, [getActiveWorkflow]);

  return (
    <SidebarGroup>
      {/* <SidebarGroupLabel>Modules</SidebarGroupLabel> */}
      <SidebarMenu>
        {workflows.map((workflow) => {
          // const isActive =
          //   workflow.url === pathname || workflow.items?.some((item) => item.url === pathname);

          return (
            <Collapsible
              key={workflow.name}
              asChild
              open={openWorkflow === workflow.name}
              onOpenChange={(isOpen) => {
                setOpenWorkflow(isOpen ? workflow.name : null);
              }}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton tooltip={workflow.name} isActive={workflow.url === pathname}>
                    {workflow.icon && <workflow.icon />}
                    <span>{workflow.name}</span>
                    {workflow.items && workflow.items.length > 0 && (
                      <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    )}
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                {workflow.items && workflow.items.length > 0 && (
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {workflow.items.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton asChild isActive={subItem.url === pathname}>
                            <a href={subItem.url}>
                              <span>{subItem.title}</span>
                            </a>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                )}
              </SidebarMenuItem>
            </Collapsible>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}

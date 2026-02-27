import { User } from "@/common/types/user";
import { Avatar, AvatarFallback, AvatarImage } from "@/common/components/ui/avatar";
import { Badge } from "@/common/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/common/components/ui/card";
import { format } from "date-fns";
import { ShieldCheck } from "lucide-react";
export const ProfileSidebar = ({ user }: { user: User }) => {
  if (!user) return null;

  const initials = user.username
    ?.split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow duration-300">
      <CardHeader className="bg-gradient-to-b from-muted/50 to-muted/10 text-center pb-6">
        <Avatar className="h-24 w-24 mx-auto ring-4 ring-background shadow-sm">
          <AvatarImage src={user.photo_profile_url ?? ""} alt={user.username} />
          <AvatarFallback className="text-xl font-bold bg-primary/10 text-primary">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="mt-4 space-y-1">
          <CardTitle className="text-xl font-bold tracking-tight">
            {user.username}
          </CardTitle>
          <div className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <span className="font-medium">
              {user.role?.role_name || "User"}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 p-6 pt-4">
        <div className="flex justify-between items-center py-3 border-b border-border/40 last:border-0">
          <span className="text-muted-foreground text-sm">Status</span>
          <Badge
            variant={user.is_active ? "outline" : "destructive"}
            className={
              user.is_active
                ? "border-green-500 text-green-600 bg-green-50"
                : ""
            }
          >
            {user.is_active ? "Aktif" : "Nonaktif"}
          </Badge>
        </div>
        <div className="flex justify-between items-center py-3 border-b border-border/40 last:border-0">
          <span className="text-muted-foreground text-sm">Bergabung</span>
          <span className="font-medium text-sm">
            {user.created_at
              ? format(new Date(user.created_at), "d MMM yyyy")
              : "-"}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

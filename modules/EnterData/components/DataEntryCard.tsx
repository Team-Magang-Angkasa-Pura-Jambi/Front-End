import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
export const DataEntryCard = ({ icon, title, description, onClick }) => (
  <motion.div
    whileHover={{ scale: 1.03 }}
    transition={{ type: "spring", stiffness: 300 }}
  >
    <Card
      onClick={onClick}
      className="flex h-full cursor-pointer flex-col justify-between overflow-hidden transition-all hover:border-primary/80 hover:shadow-lg"
    >
      <CardHeader className="flex-row items-start gap-4 space-y-0">
        <div className="rounded-lg border bg-background p-3">{icon}</div>
        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
      </CardHeader>
      <CardFooter>
        <Button variant="outline" className="ml-auto w-full sm:w-auto">
          Input Data <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  </motion.div>
);

import { Card, CardContent, CardHeader } from "./ui/card";
import { Skeleton } from "./ui/skeleton";

const BlinkSkeleton = () => {
  return (
    <div className="w-full max-w-2xl">
      {/* <div className="flex flex-col space-y-3"> */}
      <Card className="w-full backdrop-blur-sm bg-card/80 border-white/10 rounded-xl">
        <CardHeader>
          <Skeleton className="h-60 rounded-xl" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <Skeleton className="h-4 w-[200px]" />
            <Skeleton className="h-4 w-[250px]" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-4 " />
            <Skeleton className="h-4 " />
            <Skeleton className="h-4 " />
            <Skeleton className="h-4 " />
          </div>
          <div className="flex space-x-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full " />
            <Skeleton className="h-10 w-full" />
          </div>
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
      {/* </div> */}
    </div>
  );
};

export default BlinkSkeleton;

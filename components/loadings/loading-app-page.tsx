import {
  Skeleton,
  Card,
  SkeletonGroup,
  Button,
  CrossSVG,
  Typography,
  CounterClockwiseArrowSVG,
} from "@ensdomains/thorin";
import LoadingNavbar from "./loading-navbar";

export default function LoadingAppPage() {
  return (
    <div className="h-full w-full bg-[#EEF5FF]">
      <LoadingNavbar />
      <div className="flex items-center justify-center h-[500px]">
        <Skeleton loading={true}>
          <Card className="h-[449px] w-[313px]"></Card>
        </Skeleton>
      </div>
      <SkeletonGroup loading={true}>
        <div className="grid grid-cols-3 absolute bottom-16 gap-8 left-1/2 -translate-x-1/2 w-[304px]">
          <div className="h-[140px] flex flex-col justify-end items-center space-y-2">
            <Skeleton>
              <Button
                // shadow
                shape="circle"
                style={{ height: "80px", width: "80px" }}
                colorStyle="greyPrimary"
              >
                <CrossSVG style={{ height: "32px", width: "32px" }} />
              </Button>
            </Skeleton>
            <Skeleton>
              <Typography color="grey">Skip</Typography>
            </Skeleton>
          </div>
          <div className="h-[140px] flex flex-col items-center space-y-2">
            <Skeleton>
              <Button
                // shadow
                shape="circle"
                style={{ height: "80px", width: "80px" }}
                colorStyle="greyPrimary"
              >
                <CrossSVG style={{ height: "32px", width: "32px" }} />
              </Button>
            </Skeleton>
            <Skeleton>
              <Typography color="grey">Skip</Typography>
            </Skeleton>
          </div>
          <div className="h-[140px] flex flex-col items-center justify-end space-y-2">
            <Skeleton>
              <Button
                // shadow
                shape="circle"
                style={{ height: "80px", width: "80px" }}
                colorStyle="greyPrimary"
              >
                <CrossSVG style={{ height: "32px", width: "32px" }} />
              </Button>
            </Skeleton>
            <Skeleton>
              <Typography color="grey">Skip</Typography>
            </Skeleton>
          </div>
        </div>
        <div className="flex items-center justify-center absolute bottom-8 left-1/2 -translate-x-1/2">
          <Skeleton>
            <Button size="small" prefix={<CounterClockwiseArrowSVG />}>
              Undo
            </Button>
          </Skeleton>
        </div>
      </SkeletonGroup>
    </div>
  );
}

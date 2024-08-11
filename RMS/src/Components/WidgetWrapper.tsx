import { Box } from "@mui/material";
import { styled } from "@mui/system";
interface WidgetWrapperProps {
    customColor?: string;
    }
const WidgetWrapper = styled(Box)<WidgetWrapperProps>(({ customColor })  => ({
  padding: "1.5rem 1.5rem 0.75rem 1.5rem",
  borderRadius: "0.35rem",
  backgroundColor: customColor || "#0bb2a2",
   width: "15rem",
    display: "flex",
    alignItems: "center",
}));

export default WidgetWrapper;
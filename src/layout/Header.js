import {
  AppBar,
  Badge,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Toolbar,
  Typography,
} from "@mui/material";
import MailIcon from "@mui/icons-material/Mail";
import { useState } from "react";
const Header = () => {
  const [open, setOpen] = useState(false);
  const handleClose = () => {
    setOpen(false);
  };
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" color="inherit" component="div">
            Jila Sahakari Kendriya Bank, Khandwa
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          <Box sx={{ display: { xs: "none", md: "flex" } }}>
            <IconButton
              size="large"
              aria-label="show 4 new mails"
              color="inherit"
              onClick={() => setOpen(true)}
            >
              <Badge badgeContent={"help"} color="error">
                <MailIcon />
              </Badge>
            </IconButton>
          </Box>
          <Dialog
            open={open}
            onClose={handleClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
          >
            <DialogTitle id="alert-dialog-title">
              <Typography variant="h5">
                Any help or support required ?{" "}
              </Typography>
            </DialogTitle>
            <DialogContent>
              <DialogContentText id="alert-dialog-description">
                Please reach us on email :
                <ul>
                  <li>
                    {" "}
                    <a href="mailto:master.rohitjoshi@gmail.com">
                      master.rohitjoshi@gmail.com
                    </a>
                  </li>
                  <li>
                    {" "}
                    <a href="mailto:gkatkani@gmail.com">gkatkani@gmail.com</a>
                  </li>
                </ul>
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClose}>close</Button>
            </DialogActions>
          </Dialog>
        </Toolbar>
      </AppBar>
    </Box>
  );
};
export default Header;

import { AppBar, Box, Toolbar, Typography } from "@mui/material";

const Header = () => {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" color="inherit" component="div">
            Co-operative bank [V 1.0.0 (Alpha)]
          </Typography>
        </Toolbar>
      </AppBar>
    </Box>
  );
};
export default Header;

import { AppBar, Box, Toolbar, Typography } from "@mui/material";

const Header = () => {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" color="inherit" component="div">
            Jila Sahakari Kendriya Bank, Khandwa
          </Typography>
        </Toolbar>
      </AppBar>
    </Box>
  );
};
export default Header;

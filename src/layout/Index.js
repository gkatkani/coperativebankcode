import Content from "./Content";
import Footer from "./Footer";
import Header from "./Header";

const DefaultLayout = () => {
  return (
    <>
      <div>
        <Header />
      </div>
      <br />
      <div style={{ flexGrow: 1, margin: "10px" }}>
        <Content />
      </div>
      <div className="footer">
        <Footer />
      </div>
    </>
  );
};
export default DefaultLayout;

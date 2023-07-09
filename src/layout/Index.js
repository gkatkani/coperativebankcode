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
      <Content />
      <div className="footer">
        <Footer />
      </div>
    </>
  );
};
export default DefaultLayout;

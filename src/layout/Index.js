import Content from "./Content";
import Footer from "./Footer";
import Header from "./Header";

const DefaultLayout = () => {
  return (
    <>
      <div className="header">
        <Header />
      </div>
      <div className="container">
        <main className="main">
          <Content />
        </main>
      </div>
      <div className="footer">
        <Footer />
      </div>
    </>
  );
};
export default DefaultLayout;

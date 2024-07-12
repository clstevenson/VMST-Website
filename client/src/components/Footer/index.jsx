import { useLocation, useNavigate } from "react-router-dom";
import USMS from "../../assets/USMS-logo-stacked.png";
import VMST from "/assets/VMST-logo-white.png";

const Footer = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <footer className="bg-secondary p-4">
      <div id="logos" style={{ display: "flex", justifyContent: "center" }}>
        <img
          style={{ width: "200px", height: "150px", marginRight: "90px" }}
          src={USMS}
          alt="U.S. Masters Swimming Logo"
        />
        <img
          style={{ width: "200px", height: "150px", marginLeft: "90px" }}
          src={VMST}
          alt="VMST Logo"
        />
      </div>
      <div
        id="secondary-nav"
        style={{ textAlign: "center", marginTop: "40px" }}
      >
        <a
          href="/"
          style={{ textDecoration: "none", color: "white", marginLeft: "20px" }}
        >
          Home
        </a>
        <a
          href="/about-us"
          style={{ textDecoration: "none", color: "white", marginLeft: "20px" }}
        >
          About Us
        </a>
        <a
          href="/gallery"
          style={{ textDecoration: "none", color: "white", marginLeft: "20px" }}
        >
          Gallery
        </a>
        <a
          href="/contact"
          style={{ textDecoration: "none", color: "white", marginLeft: "20px" }}
        >
          Contact
        </a>
      </div>
      <div style={{ marginTop: "30px" }} className="container text-center mb-5">
        {location.pathname !== "/" && (
          <button className="btn btn-dark mb-3" onClick={() => navigate(-1)}>
            &larr; Go Back
          </button>
        )}
      </div>
    </footer>
  );
};

export default Footer;

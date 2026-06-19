import { Link } from 'react-router-dom';
import "./Footer.css";

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-container">
                <div className="footer-left">
                    <Link to="/about">ABOUT US</Link>
                    <Link to="/social-media">SOCIAL MEDIA</Link>
                </div>
                <div className="footer-right">
                    © 2026 Kaizer Tech. All Rights Reserved
                </div>
            </div>
        </footer>
    );
};

export default Footer;
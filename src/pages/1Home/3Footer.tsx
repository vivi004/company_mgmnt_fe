import { Link } from "react-router-dom";
import nishaLogo from "../../assets/Logos/NISHA LOGO .jpg";

const Footer = () => {
    return (
        <footer className="bg-slate-100 border-t border-slate-200 pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-10">

                {/* Company Info */}
                <div>
                    <div className="flex items-center space-x-3 mb-4">
                        <div className="w-14 h-14 rounded-xl overflow-hidden shadow-md">
                            <img
                                src={nishaLogo}
                                alt="Nisha Oil Mill"
                                className="w-full h-full object-cover"
                            />
                        </div>

                        <div>
                            <h3 className="text-lg font-bold text-slate-900">
                                Nisha Oil Mill
                            </h3>
                            <p className="text-sm text-slate-600">
                                Pure & Traditional Oil Products
                            </p>
                        </div>
                    </div>

                    <p className="text-slate-600 text-sm">
                        Producing high-quality natural oils such as Groundnut Oil,
                        Coconut Oil, Sesame Oil and many more with traditional
                        processing methods.
                    </p>
                </div>


                {/* Products */}
                <div>
                    <h4 className="font-bold text-slate-900 mb-4">Products</h4>
                    <ul className="space-y-2 text-sm text-slate-600">
                        <li>Groundnut Oil</li>
                        <li>Coconut Oil</li>
                        <li>Sesame Oil (Gingelly Oil)</li>
                        <li>Castoor Oil</li>
                        <li>Neem Oil</li>
                        <li>Palm Oil</li>
                        <li>Lamp Oil (Puja Oil)</li>
                    </ul>
                </div>


                {/* Quick Links */}
                <div>
                    <h4 className="font-bold text-slate-900 mb-4">Quick Links</h4>

                    <ul className="space-y-2 text-sm text-slate-600">
                        <li>
                            <Link to="/" className="hover:text-blue-600">
                                Home
                            </Link>
                        </li>
                        <li>
                            <Link to="/services" className="hover:text-blue-600">
                                Products
                            </Link>
                        </li>
                        <li>
                            <Link to="/about" className="hover:text-blue-600">
                                About Us
                            </Link>
                        </li>
                        <li>
                            <Link to="/contact" className="hover:text-blue-600">
                                Contact
                            </Link>
                        </li>
                    </ul>
                </div>


                {/* Contact */}
                <div>
                    <h4 className="font-bold text-slate-900 mb-4">Contact Us</h4>

                    <p className="text-sm text-slate-600 mb-2">
                        Nisha Oil Mill <br />
                        Konganapuram, Salem <br />
                        Tamil Nadu, India
                    </p>

                    <p className="text-sm text-slate-700">
                        Owner: <strong>Prathap</strong>
                    </p>

                    <p className="text-blue-600 font-semibold text-sm mb-4">
                        Phone: 99651 74472
                    </p>


                    {/* WhatsApp Button */}
                    <a
                        href="https://wa.me/919965174472"
                        target="_blank"
                        className="inline-block bg-green-500 text-white text-sm px-4 py-2 rounded-lg hover:bg-green-600 transition"
                    >
                        Chat on WhatsApp
                    </a>


                    {/* Google Maps */}
                    <div className="mt-3">
                        <a
                            href="https://maps.app.goo.gl/9pSHwoZxa1fnAGa97"
                            target="_blank"
                            className="text-blue-600 text-sm hover:underline"
                        >
                            View Location on Map
                        </a>
                    </div>
                </div>
            </div>


            {/* Bottom */}
            <div className="mt-12 text-center text-slate-500 text-xs">
                © {new Date().getFullYear()} Nisha Oil Mill. All rights reserved.
                <p className="mt-2">
                    Pure Quality Oils • Trusted by Customers • Traditional Taste
                </p>
            </div>
        </footer>
    );
};

export default Footer;
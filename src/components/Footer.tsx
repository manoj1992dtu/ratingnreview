import Link from 'next/link';
import { Building2, Github, Twitter, Linkedin, Mail } from 'lucide-react';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-slate-900 text-slate-300 pt-20 pb-10 border-t border-slate-800">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                    <div className="col-span-1 md:col-span-1">
                        <Link href="/" className="flex items-center gap-3 mb-6 group">
                            <div className="bg-indigo-500 p-2 rounded-xl group-hover:bg-indigo-400 transition-colors">
                                <Building2 className="h-6 w-6 text-white" />
                            </div>
                            <span className="text-xl font-black text-white tracking-tight">RatingNReview</span>
                        </Link>
                        <p className="text-slate-400 text-sm leading-relaxed mb-6">
                            The world's most transparent platform for verified workplace insights. Empowering professionals to make data-driven career decisions since 2024.
                        </p>
                        <div className="flex gap-4">
                            <a href="#" className="p-2 bg-slate-800 rounded-lg hover:bg-indigo-500 hover:text-white transition-all">
                                <Twitter className="h-4 w-4" />
                            </a>
                            <a href="#" className="p-2 bg-slate-800 rounded-lg hover:bg-indigo-500 hover:text-white transition-all">
                                <Linkedin className="h-4 w-4" />
                            </a>
                            <a href="#" className="p-2 bg-slate-800 rounded-lg hover:bg-indigo-500 hover:text-white transition-all">
                                <Mail className="h-4 w-4" />
                            </a>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-white font-bold mb-6 uppercase tracking-widest text-xs">Navigation</h3>
                        <ul className="space-y-4 text-sm font-medium">
                            <li><Link href="/" className="hover:text-white transition-colors">Home Feed</Link></li>
                            <li><Link href="/industries" className="hover:text-white transition-colors">Browse Industries</Link></li>
                            <li><Link href="/review" className="hover:text-white transition-colors">Submit Experience</Link></li>
                            <li><Link href="/companies" className="hover:text-white transition-colors">Verified Companies</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-white font-bold mb-6 uppercase tracking-widest text-xs">Resources</h3>
                        <ul className="space-y-4 text-sm font-medium">
                            <li><Link href="#" className="hover:text-white transition-colors">Salary Trends</Link></li>
                            <li><Link href="#" className="hover:text-white transition-colors">Interview Guides</Link></li>
                            <li><Link href="#" className="hover:text-white transition-colors">Company Culture</Link></li>
                            <li><Link href="#" className="hover:text-white transition-colors">Career Blog</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-white font-bold mb-6 uppercase tracking-widest text-xs">Legal & Trust</h3>
                        <ul className="space-y-4 text-sm font-medium">
                            <li><Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                            <li><Link href="#" className="hover:text-white transition-colors">Terms of Service</Link></li>
                            <li><Link href="#" className="hover:text-white transition-colors">Review Guidelines</Link></li>
                            <li><Link href="#" className="hover:text-white transition-colors">Verification Process</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-xs text-slate-500 font-medium">
                        &copy; {currentYear} RatingNReview. Built for a more transparent future.
                    </p>
                    <div className="flex gap-8 text-xs font-bold text-slate-500 uppercase tracking-widest">
                        <span className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                            Systems Operational
                        </span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;

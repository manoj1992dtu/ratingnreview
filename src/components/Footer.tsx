import Link from 'next/link';
import { Building2, Github, Twitter, Linkedin, Mail } from 'lucide-react';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="border-t border-border bg-card/30 py-12">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    <div className="col-span-1 md:col-span-1">
                        <Link href="/" className="flex items-center gap-3 mb-6">
                            <div className="bg-primary glow-sm p-2 rounded-lg">
                                <Building2 className="h-6 w-6 text-primary-foreground" />
                            </div>
                            <span className="text-xl font-bold text-foreground tracking-tight">RatingNReview</span>
                        </Link>
                        <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                            Read anonymous employee reviews and ratings to make informed career decisions.
                        </p>
                        <div className="flex gap-4">
                            <a href="#" className="p-2 bg-muted/50 rounded-lg hover:bg-primary hover:text-primary-foreground text-muted-foreground transition-all">
                                <Twitter className="h-4 w-4" />
                            </a>
                            <a href="#" className="p-2 bg-muted/50 rounded-lg hover:bg-primary hover:text-primary-foreground text-muted-foreground transition-all">
                                <Linkedin className="h-4 w-4" />
                            </a>
                            <a href="#" className="p-2 bg-muted/50 rounded-lg hover:bg-primary hover:text-primary-foreground text-muted-foreground transition-all">
                                <Mail className="h-4 w-4" />
                            </a>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-foreground font-semibold mb-4 text-sm">Navigation</h3>
                        <ul className="space-y-3 text-sm">
                            <li><Link href="/" className="text-muted-foreground hover:text-primary transition-colors">Home Feed</Link></li>
                            <li><Link href="/industries" className="text-muted-foreground hover:text-primary transition-colors">Browse Industries</Link></li>
                            <li><Link href="/review" className="text-muted-foreground hover:text-primary transition-colors">Submit Experience</Link></li>
                            <li><Link href="/companies" className="text-muted-foreground hover:text-primary transition-colors">Verified Companies</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-foreground font-semibold mb-4 text-sm">Resources</h3>
                        <ul className="space-y-3 text-sm">
                            <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Salary Trends</Link></li>
                            <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Interview Guides</Link></li>
                            <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Company Culture</Link></li>
                            <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Career Blog</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-foreground font-semibold mb-4 text-sm">Legal & Trust</h3>
                        <ul className="space-y-3 text-sm">
                            <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Privacy Policy</Link></li>
                            <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Terms of Service</Link></li>
                            <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Review Guidelines</Link></li>
                            <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Verification Process</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-xs text-muted-foreground font-medium">
                        &copy; {currentYear} RatingNReview. Built for a more transparent future.
                    </p>
                    <div className="flex gap-8 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                        <span className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-success rounded-full animate-pulse"></div>
                            Systems Operational
                        </span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;

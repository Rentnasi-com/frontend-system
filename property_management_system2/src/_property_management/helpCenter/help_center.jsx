import { useState } from 'react';
import { Search, Home, Users, FileText, DollarSign, Bell, Settings, ChevronDown, ChevronUp, Building2, ClipboardList, HelpCircle, Mail, Phone } from 'lucide-react';
import { DashboardHeader } from '../properties/dashboard/page_components';

export default function HelpCenter() {
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedSections, setExpandedSections] = useState({});

    const toggleSection = (id) => {
        setExpandedSections(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    const helpSections = [
        {
            id: 'getting-started',
            icon: Home,
            title: 'Getting Started',
            color: 'text-yellow-600',
            bgColor: 'bg-yellow-50',
            topics: [
                {
                    question: 'How do I set up my account?',
                    answer: 'After signing up, complete your profile by adding your company information, uploading your logo, and setting up payment methods. Navigate to Settings > Company Profile to get started.'
                },
                {
                    question: 'How do I add my first property?',
                    answer: 'Click on Properties in the sidebar, then click the "Add Property" button. Fill in the property details including address, type, number of units, and amenities. You can also upload photos and documents.'
                },
                {
                    question: 'What are the system requirements?',
                    answer: 'RentalPay works on any modern web browser (Chrome, Firefox, Safari, Edge). For the best experience, we recommend using the latest version of your browser. Mobile apps are available for iOS and Android.'
                }
            ]
        },
        {
            id: 'properties',
            icon: Building2,
            title: 'Property Management',
            color: 'text-purple-600',
            bgColor: 'bg-purple-50',
            topics: [
                {
                    question: 'How do I add units to a property?',
                    answer: 'Open the property details page and click "Add Unit". Enter the unit number, type (studio, 1BR, 2BR, etc.), square footage, and rent amount. You can set amenities specific to each unit.'
                },
                {
                    question: 'Can I manage multiple properties?',
                    answer: 'Yes! RentalPay supports unlimited properties. Use the property selector in the dashboard to switch between properties or view all properties at once.'
                },
                {
                    question: 'How do I track maintenance issues?',
                    answer: 'Go to Maintenance > Create Request. Select the property and unit, describe the issue, set priority level, and assign it to a maintenance staff member. Tenants can also submit requests through their portal.'
                }
            ]
        },
        {
            id: 'tenants',
            icon: Users,
            title: 'Tenant Management',
            color: 'text-green-600',
            bgColor: 'bg-green-50',
            topics: [
                {
                    question: 'How do I add a new tenant?',
                    answer: 'Navigate to Tenants > Add Tenant. Enter their personal information, contact details, and lease information. You can also upload documents like ID copies and employment verification.'
                },
                {
                    question: 'How do tenants access their portal?',
                    answer: 'When you add a tenant, they automatically receive an email invitation with login credentials. They can access their portal at portal.rentalpay.africa to view lease details, pay rent, and submit maintenance requests.'
                },
                {
                    question: 'Can I send bulk messages to tenants?',
                    answer: 'Yes! Go to Communications > Send Message, select multiple tenants or filter by property, and compose your message. You can send via email, SMS, or both.'
                }
            ]
        },
        {
            id: 'payments',
            icon: DollarSign,
            title: 'Payments & Billing',
            color: 'text-emerald-600',
            bgColor: 'bg-emerald-50',
            topics: [
                {
                    question: 'What payment methods are supported?',
                    answer: 'RentalPay supports M-Pesa, bank transfers, credit/debit cards, and cash payments. All transactions are securely processed and automatically recorded in the system.'
                },
                {
                    question: 'How do I record a rent payment?',
                    answer: 'Payments made online are automatically recorded. For offline payments, go to Payments > Record Payment, select the tenant, enter the amount, payment method, and date. You can also upload a receipt.'
                },
                {
                    question: 'Can tenants set up automatic payments?',
                    answer: 'Yes! Tenants can enable auto-pay in their portal. They can choose to pay via M-Pesa or card, and set the payment to process on a specific day each month.'
                },
                {
                    question: 'How do I generate invoices?',
                    answer: 'Invoices are automatically generated based on lease agreements. You can also create custom invoices under Billing > Create Invoice for additional charges like utilities or repairs.'
                }
            ]
        },
        {
            id: 'leases',
            icon: FileText,
            title: 'Lease Management',
            color: 'text-orange-600',
            bgColor: 'bg-orange-50',
            topics: [
                {
                    question: 'How do I create a lease agreement?',
                    answer: 'Go to Leases > Create Lease. Select the property and unit, choose the tenant, set the lease term, rent amount, deposit, and start date. You can use templates or customize the agreement.'
                },
                {
                    question: 'Can I renew a lease?',
                    answer: 'Yes! When a lease is nearing expiration, you\'ll see a "Renew Lease" option. You can adjust the rent amount and terms before sending the renewal notice to the tenant.'
                },
                {
                    question: 'How do I handle lease terminations?',
                    answer: 'Go to the lease details and click "Terminate Lease". Enter the termination date and reason. The system will calculate any prorated rent and refunds, and update the unit status to vacant.'
                }
            ]
        },
        {
            id: 'reports',
            icon: ClipboardList,
            title: 'Reports & Analytics',
            color: 'text-pink-600',
            bgColor: 'bg-pink-50',
            topics: [
                {
                    question: 'What reports are available?',
                    answer: 'RentalPay offers income statements, occupancy reports, payment history, tenant ledgers, maintenance logs, and custom reports. All reports can be exported to PDF or Excel.'
                },
                {
                    question: 'How do I track rental income?',
                    answer: 'The Dashboard shows real-time income tracking. For detailed analysis, go to Reports > Income Report. You can filter by property, date range, and payment status.'
                },
                {
                    question: 'Can I see which units are vacant?',
                    answer: 'Yes! The Occupancy Report shows all vacant units, upcoming vacancies, and historical occupancy rates. You can also see average time to rent and revenue loss from vacancies.'
                }
            ]
        },
        {
            id: 'notifications',
            icon: Bell,
            title: 'Notifications & Alerts',
            color: 'text-yellow-600',
            bgColor: 'bg-yellow-50',
            topics: [
                {
                    question: 'How do I set up rent reminders?',
                    answer: 'Go to Settings > Notifications. Enable rent reminders and choose when to send them (e.g., 3 days before due date). You can customize the message and delivery method.'
                },
                {
                    question: 'What automatic notifications are sent?',
                    answer: 'The system automatically sends payment confirmations, late payment notices, lease expiration alerts, maintenance updates, and move-in/move-out reminders.'
                },
                {
                    question: 'Can I customize notification templates?',
                    answer: 'Yes! Go to Settings > Communication Templates. You can edit all email and SMS templates, add your branding, and customize the message content.'
                }
            ]
        },
        {
            id: 'settings',
            icon: Settings,
            title: 'Settings & Configuration',
            color: 'text-indigo-600',
            bgColor: 'bg-indigo-50',
            topics: [
                {
                    question: 'How do I add team members?',
                    answer: 'Go to Settings > Team Members > Invite User. Enter their email, assign a role (Admin, Property Manager, Accountant, or Maintenance), and they\'ll receive an invitation email.'
                },
                {
                    question: 'Can I customize late fees?',
                    answer: 'Yes! Go to Settings > Billing Settings. Set your late fee amount or percentage, grace period, and maximum fee cap. These will apply automatically to overdue payments.'
                },
                {
                    question: 'How do I change my subscription plan?',
                    answer: 'Navigate to Settings > Subscription. You can upgrade, downgrade, or cancel your plan. Changes take effect immediately, and you\'ll only pay the prorated difference.'
                }
            ]
        }
    ];

    const filteredSections = helpSections.map(section => ({
        ...section,
        topics: section.topics.filter(topic =>
            searchQuery === '' ||
            topic.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            topic.answer.toLowerCase().includes(searchQuery.toLowerCase())
        )
    })).filter(section => section.topics.length > 0);

    return (
        <>
            <DashboardHeader
                title="Help Center"
                description="Find answers to common questions and learn how to use RentalPay."
            // name="New property"
            // link="/add-property/general-information"
            // hideSelect={false}
            // hideLink={true}
            />
            {/* Main Content */}
            <div className="rounded-lg border border-gray-200 bg-white mx-4 mt-5 p-4">
                {/* Quick Links Grid */}
                {searchQuery === '' && (
                    <div className="grid md:grid-cols-4 gap-6 mb-12">
                        {helpSections.map((section) => {
                            const Icon = section.icon;
                            return (
                                <div
                                    key={section.id}
                                    onClick={() => toggleSection(section.id)}
                                    className="bg-white rounded p-6 shadow-md hover:shadow-xl transition-shadow cursor-pointer border-2 border-transparent hover:border-yellow-200"
                                >
                                    <div className={`${section.bgColor} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                                        <Icon className={section.color} size={24} />
                                    </div>
                                    <h3 className="font-semibold text-gray-900 mb-2">{section.title}</h3>
                                    <p className="text-sm text-gray-600">{section.topics.length} articles</p>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Help Sections */}
                <div className="max-w-4xl mx-auto space-y-4">
                    {filteredSections.length === 0 && searchQuery !== '' ? (
                        <div className="bg-white rounded-xl p-12 text-center shadow-md">
                            <HelpCircle className="mx-auto text-gray-400 mb-4" size={48} />
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">No results found</h3>
                            <p className="text-gray-600">Try searching with different keywords or browse the categories above.</p>
                        </div>
                    ) : (
                        filteredSections.map((section) => {
                            const Icon = section.icon;
                            const isExpanded = expandedSections[section.id];

                            return (
                                <div key={section.id} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
                                    <button
                                        onClick={() => toggleSection(section.id)}
                                        className="w-full px-6 py-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`${section.bgColor} p-3 rounded-lg`}>
                                                <Icon className={section.color} size={24} />
                                            </div>
                                            <div className="text-left">
                                                <h2 className="text-xl font-semibold text-gray-900">{section.title}</h2>
                                                <p className="text-sm text-gray-500">{section.topics.length} articles</p>
                                            </div>
                                        </div>
                                        {isExpanded ? <ChevronUp size={24} className="text-gray-400" /> : <ChevronDown size={24} className="text-gray-400" />}
                                    </button>

                                    {isExpanded && (
                                        <div className="px-6 pb-6 space-y-6 border-t border-gray-100 pt-6">
                                            {section.topics.map((topic, idx) => (
                                                <div key={idx} className="pl-4 border-l-4 border-yellow-200">
                                                    <h3 className="font-semibold text-gray-900 mb-2 text-lg">{topic.question}</h3>
                                                    <p className="text-gray-700 leading-relaxed">{topic.answer}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Contact Support */}
                <div className="max-w-4xl mx-auto mt-12">
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white text-center shadow-xl">
                        <h2 className="text-2xl font-bold mb-3">Still need help?</h2>
                        <p className="text-yellow-100 mb-6">Our support team is ready to assist you</p>
                        <div className="flex flex-wrap justify-center gap-4">
                            <a href="mailto:support@rentalpay.africa" className="flex items-center gap-2 bg-white text-yellow-600 px-6 py-3 rounded-lg font-semibold hover:bg-yellow-50 transition-colors">
                                <Mail size={20} />
                                Email Support
                            </a>
                            <a href="tel:+254700000000" className="flex items-center gap-2 bg-white text-yellow-600 px-6 py-3 rounded-lg font-semibold hover:bg-yellow-50 transition-colors">
                                <Phone size={20} />
                                Call Us
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </>

    );
}
export const dummyAdminData = {
  // Key Performance Indicators
  kpis: {
    totalRevenue: "₹84,50,000",
    revenueGrowth: "+24.8%",
    activeEventsCount: 18,
    pendingRequestsCount: 24,
    urgentRequestsCount: 6,
    totalPhotosCount: 3420,
    totalFilmsCount: 36,
    storageUsedGb: "428.6 GB",
    storageQuotaGb: "1000 GB",
    activeStorageProvider: "Cloudinary",
  },

  // Shoot Events Schedule
  events: [
    {
      id: "EVT-2026-001",
      couple: "Varsha & Shiva",
      eventType: "Royal Muhurtham & Grand Reception",
      date: "Oct 12 - 14, 2026",
      startDate: "2026-10-12",
      venue: "Taj Falaknuma Palace",
      city: "Hyderabad",
      package: "The Royal Heritage Signature (₹2,85,000)",
      status: "Upcoming", // 'Upcoming' | 'In Progress' | 'Post-Production' | 'Completed'
      crew: [
        { name: "Praveen Kumar", role: "Lead Fine-Art Photographer" },
        { name: "Aditya Roy", role: "4K Cinematographer" },
        { name: "Sameer Joshi", role: "Aerial Drone Pilot" },
        { name: "Kiran R.", role: "Candid Specialist" }
      ],
      deliverables: {
        rawStatus: "Scheduled",
        filmProgress: 0,
        photosEdited: 0,
        totalExpected: 1200,
        albumApproved: false,
      },
      coverImage: "https://res.cloudinary.com/dbwzgdmtv/image/upload/v1768980002/portfolio/gddb5ytprmnhagxmlgew.jpg"
    },
    {
      id: "EVT-2026-002",
      couple: "Dr. Ananya & Siddharth",
      eventType: "3-Day Destination Palace Wedding",
      date: "Nov 02 - 04, 2026",
      startDate: "2026-11-02",
      venue: "Udaipur Lake Palace & Jagmandir Island",
      city: "Udaipur, Rajasthan",
      package: "Destination Fine-Art Cinema (₹3,20,000)",
      status: "Upcoming",
      crew: [
        { name: "Praveen Kumar", role: "Master Lead" },
        { name: "Vikram Sen", role: "Colorist & Cinematographer" },
        { name: "Manish Shah", role: "Drone Operator" }
      ],
      deliverables: {
        rawStatus: "Scheduled",
        filmProgress: 0,
        photosEdited: 0,
        totalExpected: 1400,
        albumApproved: false,
      },
      coverImage: "https://res.cloudinary.com/dbwzgdmtv/image/upload/v1767866337/portfolio/vdeemhlfu5s1ff0xudgf.jpg"
    },
    {
      id: "EVT-2026-003",
      couple: "Athiya & KL Rahul",
      eventType: "Celebrity Intimate Sacred Vows",
      date: "Sep 20 - 21, 2026",
      startDate: "2026-09-20",
      venue: "Khandala Heritage Estate",
      city: "Maharashtra",
      package: "Bespoke Royal Master Cut (₹4,50,000)",
      status: "Post-Production",
      crew: [
        { name: "Praveen Kumar", role: "Fine-Art Lead" },
        { name: "Rohan V.", role: "Senior Editor" }
      ],
      deliverables: {
        rawStatus: "Backed Up to S3 & Local SSD",
        filmProgress: 85,
        photosEdited: 980,
        totalExpected: 1100,
        albumApproved: true,
      },
      coverImage: "https://res.cloudinary.com/dbwzgdmtv/image/upload/v1767867231/portfolio/dylnxhcxwt3hjyv4lkgk.jpg"
    },
    {
      id: "EVT-2026-004",
      couple: "Radhika & Varun",
      eventType: "Haldi, Sangeet & Sunset Muhurtham",
      date: "Sep 24 - 25, 2026",
      startDate: "2026-09-24",
      venue: "Jaipur Heritage Haveli",
      city: "Jaipur",
      package: "The Royal Heritage Signature (₹2,85,000)",
      status: "In Progress",
      crew: [
        { name: "Sameer Joshi", role: "Drone Pilot" },
        { name: "Naveen P.", role: "Candid Specialist" }
      ],
      deliverables: {
        rawStatus: "Ingesting Day 1 Data",
        filmProgress: 20,
        photosEdited: 150,
        totalExpected: 1200,
        albumApproved: false,
      },
      coverImage: "https://res.cloudinary.com/dbwzgdmtv/image/upload/v1779015790/portfolio/c7ghm0ajbponglxzbxqi.jpg"
    },
    {
      id: "EVT-2026-005",
      couple: "Kavya & Pranay",
      eventType: "Sunset Beachfront Wedding & Reception",
      date: "Aug 14 - 15, 2026",
      startDate: "2026-08-14",
      venue: "Alibaug Private Ocean Villa",
      city: "Alibaug",
      package: "Destination Fine-Art Cinema (₹2,15,000)",
      status: "Completed",
      crew: [
        { name: "Praveen Kumar", role: "Lead" },
        { name: "Aditya Roy", role: "Cinema Director" }
      ],
      deliverables: {
        rawStatus: "Delivered on 2TB HDD",
        filmProgress: 100,
        photosEdited: 850,
        totalExpected: 850,
        albumApproved: true,
      },
      coverImage: "https://res.cloudinary.com/dbwzgdmtv/image/upload/v1767763940/portfolio/gqx3qmpuir1yidsgyslb.jpg"
    }
  ],

  // Client Requests & Inquiries
  requests: [
    {
      id: "REQ-9841",
      clientName: "Meera Reddy & Arvind",
      email: "meera.reddy@gmail.com",
      phone: "+91 98490 11234",
      eventDates: "Dec 18 - 20, 2026",
      location: "Ramoji Film City / Hyderabad",
      estimatedBudget: "₹3,50,000",
      servicesRequested: ["3-Day Multi-Cam 4K", "Aerial Drone", "Italian Leather Album", "Social Reels"],
      status: "New", // 'New' | 'Under Review' | 'Quote Sent' | 'Confirmed' | 'Declined'
      priority: "high",
      submittedAt: "2 hours ago",
      notes: "Bride is a luxury fashion designer. Emphasized rich jewel-tone color grading and unscripted parent moments."
    },
    {
      id: "REQ-9840",
      clientName: "Deepika Sharma & Rohan",
      email: "deepika.sharma@yahoo.com",
      phone: "+91 97110 54321",
      eventDates: "Jan 14 - 16, 2027",
      location: "Umaid Bhawan Palace, Jodhpur",
      estimatedBudget: "₹4,80,000",
      servicesRequested: ["Celebrity Destination Package", "Live Drone Feed", "Master Cinema 4K Film"],
      status: "Quote Sent",
      priority: "high",
      submittedAt: "5 hours ago",
      notes: "Royal family connection. Quote sent with custom 8-member master crew breakdown."
    },
    {
      id: "REQ-9839",
      clientName: "Karthik Sundaram & Sneha",
      email: "karthik.s@outlook.com",
      phone: "+91 94440 98765",
      eventDates: "Nov 28, 2026",
      location: "Temple Gardens, Chennai",
      estimatedBudget: "₹1,60,000",
      servicesRequested: ["Sacred Muhurtham Full Day", "Handcrafted Keepsake Album"],
      status: "Under Review",
      priority: "medium",
      submittedAt: "Yesterday",
      notes: "Traditional Iyer wedding with early morning 4 AM muhurtham auspicious timings."
    },
    {
      id: "REQ-9838",
      clientName: "Pooja Hegde (Family) & Vikram",
      email: "pooja.mgmt@gmail.com",
      phone: "+91 98200 45678",
      eventDates: "Feb 05 - 08, 2027",
      location: "Goa Beachfront Resort",
      estimatedBudget: "₹5,20,000",
      servicesRequested: ["Pre-wedding Yacht Shoot", "Sunset Vows", "3 Reels in 24 Hours", "4K Teaser"],
      status: "Confirmed",
      priority: "high",
      submittedAt: "2 days ago",
      notes: "Advance 50% deposit received. Assigned Praveen Kumar and drone pilot team."
    },
    {
      id: "REQ-9837",
      clientName: "Rahul Bansal & Ishita",
      email: "rahul.b@techcorp.com",
      phone: "+91 98100 23456",
      eventDates: "Nov 10, 2026",
      location: "Bengaluru Heritage Club",
      estimatedBudget: "₹2,10,000",
      servicesRequested: ["Cocktail Party & Reception Coverage", "Fine-Art Couple Editorial"],
      status: "Quote Sent",
      priority: "normal",
      submittedAt: "3 days ago",
      notes: "Awaiting approval from groom's father regarding extra video editor on site."
    },
    {
      id: "REQ-9836",
      clientName: "Tanya Sen & Amit",
      email: "tanya.sen@gmail.com",
      phone: "+91 98310 87654",
      eventDates: "Oct 25, 2026",
      location: "Kolkata Heritage Lawn",
      estimatedBudget: "₹1,40,000",
      servicesRequested: ["Haldi + Wedding Single Day"],
      status: "Declined",
      priority: "low",
      submittedAt: "4 days ago",
      notes: "Declined due to date overlap with Taj Falaknuma booking."
    }
  ],

  // System & Activity Notifications
  notifications: [
    {
      id: "NOTIF-01",
      type: "inquiry",
      title: "High-Priority Enquiry",
      message: "Meera Reddy submitted an enquiry for 3-Day Wedding at Ramoji Film City (Budget ₹3.5L).",
      time: "15 minutes ago",
      isRead: false,
      priority: "high"
    },
    {
      id: "NOTIF-02",
      type: "payment",
      title: "Booking Deposit Confirmed",
      message: "Pooja Hegde family paid ₹2,60,000 token deposit for Goa Destination wedding.",
      time: "1 hour ago",
      isRead: false,
      priority: "high"
    },
    {
      id: "NOTIF-03",
      type: "storage",
      title: "Cloud Bucket Sync Active",
      message: "Cloudinary synchronized 48 new high-res wedding stills for Athiya & Rahul gallery.",
      time: "3 hours ago",
      isRead: false,
      priority: "normal"
    },
    {
      id: "NOTIF-04",
      type: "event",
      title: "Upcoming Shoot Alert",
      message: "Varsha & Shiva wedding at Taj Falaknuma is in 13 days. Verify equipment and team roster.",
      time: "Yesterday",
      isRead: true,
      priority: "normal"
    },
    {
      id: "NOTIF-05",
      type: "system",
      title: "Multi-Cloud Storage Ready",
      message: "AWS S3, Azure Blob, GCS, and Firebase connectors loaded and ready to switch.",
      time: "2 days ago",
      isRead: true,
      priority: "low"
    }
  ],

  // Storage Bucket Providers Config Mock
  storageProviders: [
    {
      id: "cloudinary",
      name: "Cloudinary Cloud CDN",
      badge: "Active Provider",
      description: "Automatic responsive transformations, secure video streaming, and ultrafast CDN.",
      status: "connected",
      bucketOrFolder: "portfolio/prazna",
      region: "Global Edge",
      isActive: true,
      stats: { used: "312 GB", files: "3,140 files", bandwidth: "1.2 TB / mo" }
    },
    {
      id: "s3",
      name: "Amazon Web Services (S3)",
      badge: "Cold Backup",
      description: "Scalable object storage with CloudFront CDN integration and 99.999999999% durability.",
      status: "ready",
      bucketOrFolder: "prazna-photography-bucket",
      region: "ap-south-1 (Mumbai)",
      isActive: false,
      stats: { used: "116 GB", files: "280 raw master files", bandwidth: "450 GB / mo" }
    },
    {
      id: "azure",
      name: "Microsoft Azure Blob",
      badge: "Configured",
      description: "Massively scalable cloud storage for unstructured master video files & archives.",
      status: "ready",
      bucketOrFolder: "prazna-media-container",
      region: "Central India (Pune)",
      isActive: false,
      stats: { used: "0 GB", files: "0 files", bandwidth: "0 GB" }
    },
    {
      id: "gcs",
      name: "Google Cloud Storage (GCS)",
      badge: "Configured",
      description: "High-performance object storage with Google global private network backbone.",
      status: "ready",
      bucketOrFolder: "prazna-photography-media",
      region: "asia-south1 (Mumbai)",
      isActive: false,
      stats: { used: "0 GB", files: "0 files", bandwidth: "0 GB" }
    },
    {
      id: "firebase",
      name: "Firebase Cloud Storage",
      badge: "Configured",
      description: "Direct client SDK upload capability with Google Cloud Storage integration.",
      status: "ready",
      bucketOrFolder: "prazna-photography.appspot.com",
      region: "asia-south1",
      isActive: false,
      stats: { used: "0 GB", files: "0 files", bandwidth: "0 GB" }
    },
    {
      id: "local",
      name: "Local Server Disk Storage",
      badge: "Offline Dev",
      description: "Stores uploaded files directly to local backend/uploads folder.",
      status: "ready",
      bucketOrFolder: "backend/uploads",
      region: "Localhost:5000",
      isActive: false,
      stats: { used: "2.4 GB", files: "45 files", bandwidth: "Local" }
    }
  ]
};

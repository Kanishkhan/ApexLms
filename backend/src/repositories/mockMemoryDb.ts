// Enterprise-grade In-Memory Database Fallback
// Loaded with rich seed data for a production-ready startup feel

export let mockUsers = [
  {
    _id: 'u-1',
    name: 'Sarah Connor',
    email: 'student@lms.com',
    passwordHash: '$2a$10$T8Z.m241YpE.Yx6wD2C1ueaP76Zbe.gHn7jQ6xHlC7Qf7QZ4tPqvi', // 'password'
    role: 'student' as const,
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    refreshToken: '',
    createdAt: new Date('2026-01-10'),
    updatedAt: new Date(),
  },
  {
    _id: 'u-2',
    name: 'Dr. Evelyn Foster',
    email: 'instructor@lms.com',
    passwordHash: '$2a$10$T8Z.m241YpE.Yx6wD2C1ueaP76Zbe.gHn7jQ6xHlC7Qf7QZ4tPqvi', // 'password'
    role: 'instructor' as const,
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    refreshToken: '',
    createdAt: new Date('2026-01-05'),
    updatedAt: new Date(),
  },
  {
    _id: 'u-3',
    name: 'Alexander Pierce',
    email: 'admin@lms.com',
    passwordHash: '$2a$10$T8Z.m241YpE.Yx6wD2C1ueaP76Zbe.gHn7jQ6xHlC7Qf7QZ4tPqvi', // 'password'
    role: 'admin' as const,
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    refreshToken: '',
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date(),
  }
];

export let mockCourses = [
  {
    _id: 'c-1',
    title: 'Advanced System Design & Microservices',
    subtitle: 'Master distributed systems, event-driven architectures, and high-concurrency scaling.',
    description: 'This enterprise-grade course covers theoretical and practical aspects of building distributed systems. You will learn about load balancing, database sharding, caching strategies, messaging queues (Kafka, RabbitMQ), containerization (Docker, Kubernetes), and design patterns like CQRS and Event Sourcing.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600',
    instructor: 'u-2',
    price: 199,
    category: 'Software Engineering',
    tags: ['System Design', 'Microservices', 'Scale'],
    level: 'advanced' as const,
    status: 'published' as const,
    studentsEnrolled: ['u-1'],
    createdAt: new Date('2026-02-15'),
    updatedAt: new Date(),
  },
  {
    _id: 'c-2',
    title: 'React & TypeScript Enterprise Architecture',
    subtitle: 'Scale frontend projects using Redux Toolkit, clean folder structures, and optimized UI flows.',
    description: 'Learn how massive frontend codebases are structured in top-tier companies. This course details robust state management, responsive custom hooks, performance profiling, advanced code-splitting, custom rendering pipelines, and robust testing using Jest and Playwright.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600',
    instructor: 'u-2',
    price: 149,
    category: 'Frontend Development',
    tags: ['React', 'TypeScript', 'Redux'],
    level: 'intermediate' as const,
    status: 'published' as const,
    studentsEnrolled: [] as string[],
    createdAt: new Date('2026-03-01'),
    updatedAt: new Date(),
  },
  {
    _id: 'c-3',
    title: 'Introduction to Cloud-Native DevOps',
    subtitle: 'Unlock the power of Docker, Kubernetes, CI/CD pipelines, and cloud monitoring.',
    description: 'A beginner-friendly entry into the DevOps space. Learn infrastructure as code (Terraform), continuous integration with GitHub Actions, cluster management using Kubernetes, and metrics logging using Prometheus and Grafana.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1600132806370-bf17e65e942f?w=600',
    instructor: 'u-2',
    price: 99,
    category: 'DevOps',
    tags: ['Docker', 'Kubernetes', 'Cloud'],
    level: 'beginner' as const,
    status: 'published' as const,
    studentsEnrolled: [] as string[],
    createdAt: new Date('2026-03-10'),
    updatedAt: new Date(),
  }
];

export let mockModules = [
  {
    _id: 'm-1',
    course: 'c-1',
    title: 'Foundations of Distributed Systems',
    description: 'Core theories and protocols behind distributed database networks.',
    order: 1,
    createdAt: new Date('2026-02-15'),
    updatedAt: new Date(),
  },
  {
    _id: 'm-2',
    course: 'c-1',
    title: 'Asynchronous Architectures & Event-Driven Patterns',
    description: 'Utilizing message streams and broker queues to decouple service tasks.',
    order: 2,
    createdAt: new Date('2026-02-15'),
    updatedAt: new Date(),
  },
  {
    _id: 'm-3',
    course: 'c-2',
    title: 'TypeScript Compiler Configuration & Project Scaffolding',
    description: 'Laying out high-quality settings for mono-repos and single page apps.',
    order: 1,
    createdAt: new Date('2026-03-01'),
    updatedAt: new Date(),
  }
];

export let mockLessons = [
  {
    _id: 'l-1',
    module: 'm-1',
    course: 'c-1',
    title: 'Introduction to CAP Theorem & PACELC',
    description: 'Understand consistency, availability, and partition tolerance trade-offs.',
    type: 'video' as const,
    content: 'In this lesson, we break down the famous CAP Theorem introduced by Eric Brewer. We analyze why a distributed database cannot offer both consistency and availability in the presence of network partition. We also expand this to the PACELC theorem, comparing MongoDB, Cassandra, and relational stores.',
    videoUrl: 'https://res.cloudinary.com/demo/video/upload/dpg_sample.mp4',
    pdfUrl: '',
    order: 1,
    duration: 15,
    isFreePreview: true,
    createdAt: new Date('2026-02-15'),
    updatedAt: new Date(),
  },
  {
    _id: 'l-2',
    module: 'm-1',
    course: 'c-1',
    title: 'Practical Database Sharding Mechanics',
    description: 'Implementing horizontal partition keys across database nodes.',
    type: 'pdf' as const,
    content: 'This written guide walks you through range-based, hash-based, and directory-based sharding systems. Review standard strategies for routing keys without creating hotspots.',
    videoUrl: '',
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    order: 2,
    duration: 10,
    isFreePreview: false,
    createdAt: new Date('2026-02-15'),
    updatedAt: new Date(),
  },
  {
    _id: 'l-3',
    module: 'm-2',
    course: 'c-1',
    title: 'Designing Message Pipelines with Apache Kafka',
    description: 'Analyzing Kafka topics, partition routing, and consumer groups.',
    type: 'video' as const,
    content: 'Watch this walk-through on setting up event queues. We detail standard practices for preserving event order using keys, handling backpressure, and scaling consumer groups.',
    videoUrl: 'https://res.cloudinary.com/demo/video/upload/dpg_sample.mp4',
    pdfUrl: '',
    order: 1,
    duration: 22,
    isFreePreview: false,
    createdAt: new Date('2026-02-15'),
    updatedAt: new Date(),
  },
  {
    _id: 'l-4',
    module: 'm-3',
    course: 'c-2',
    title: 'Configuring Strict TypeScript Compiles',
    description: 'Setting up tsconfig files for ultimate code safety.',
    type: 'text' as const,
    content: 'Review the critical flags to turn on in `tsconfig.json` including `noImplicitAny`, `strictNullChecks`, `noUnusedLocals`, and `noUnusedParameters` to eliminate runtime bugs.',
    videoUrl: '',
    pdfUrl: '',
    order: 1,
    duration: 8,
    isFreePreview: true,
    createdAt: new Date('2026-03-01'),
    updatedAt: new Date(),
  }
];

export let mockEnrollments = [
  {
    _id: 'e-1',
    student: 'u-1',
    course: 'c-1',
    progressPercentage: 25,
    enrolledAt: new Date('2026-02-20'),
    completedAt: undefined as Date | undefined,
  }
];

export let mockProgress = [
  {
    _id: 'p-1',
    student: 'u-1',
    course: 'c-1',
    lesson: 'l-1',
    isCompleted: true,
    bookmark: true,
    lastViewedAt: new Date(),
  },
  {
    _id: 'p-2',
    student: 'u-1',
    course: 'c-1',
    lesson: 'l-2',
    isCompleted: false,
    bookmark: false,
    lastViewedAt: new Date(),
  }
];

export let mockQuizzes = [
  {
    _id: 'q-1',
    course: 'c-1',
    module: 'm-1',
    title: 'Distributed Systems Foundations Quiz',
    description: 'Test your understanding of CAP, PACELC, and database sharding techniques.',
    passingScore: 70,
    questions: [
      {
        questionText: 'What does the P stand for in CAP theorem?',
        options: ['Performance', 'Partition Tolerance', 'Persistence', 'Privacy'],
        correctAnswerIndex: 1,
        points: 1,
      },
      {
        questionText: 'According to PACELC, if there is NO partition (E), what trade-off must a system make?',
        options: ['Latency (L) vs Consistency (C)', 'Availability (A) vs Consistency (C)', 'Security vs Cost', 'Speed vs Size'],
        correctAnswerIndex: 0,
        points: 1,
      },
      {
        questionText: 'Which sharding key strategy is prone to hotspots when scaling sequentially incremented IDs?',
        options: ['Hash-based sharding', 'Range-based sharding', 'Directory-based sharding', 'All of the above'],
        correctAnswerIndex: 1,
        points: 1,
      }
    ],
    createdAt: new Date('2026-02-15'),
    updatedAt: new Date(),
  }
];

export let mockQuizAttempts = [
  {
    _id: 'qa-1',
    student: 'u-1',
    quiz: 'q-1',
    score: 66.6,
    passed: false,
    answers: [1, 1, 1], // Wrong on Q2
    attemptedAt: new Date('2026-02-21'),
  }
];

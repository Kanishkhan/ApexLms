import bcrypt from 'bcryptjs';
// Watch trigger comment for dev reload
import { User } from '../models/User';
import { Course } from '../models/Course';
import { Enrollment } from '../models/Enrollment';
import { Module } from '../models/Module';
import { Lesson } from '../models/Lesson';
import { Quiz } from '../models/Quiz';
import { Progress } from '../models/Progress';
import { CodingProblem } from '../models/CodingProblem';
import { Assignment } from '../models/Assignment';

/**
 * Seeds the database with demo data.
 * This runs at startup if MongoDB is connected and no courses are present.
 * Ensures complete, functional data for both @lms.com and @apex.com credentials.
 */
export const seedDemoData = async (): Promise<void> => {
  if (global.isMockDb) return; // Skip seeding in mock mode

  try {
    // Migration: fix dpg_sample typo in any previously created lessons
    await Lesson.updateMany(
      { videoUrl: /dpg_sample/ },
      { $set: { videoUrl: 'https://res.cloudinary.com/demo/video/upload/sample.mp4' } }
    );

    // Check if seeding is needed (idempotent)
    const courseCount = await Course.countDocuments({});
    if (courseCount > 0) {
      console.log('✅ Demo data already seeded, skipping.');
      return;
    }

    console.log('🌱 Seeding demo data...');

    // Clean all collections to ensure fresh matching references
    await User.deleteMany({});
    await Course.deleteMany({});
    await Module.deleteMany({});
    await Lesson.deleteMany({});
    await Quiz.deleteMany({});
    await Enrollment.deleteMany({});
    await Progress.deleteMany({});
    await CodingProblem.deleteMany({});
    await Assignment.deleteMany({});

    // Hash passwords
    const salt = await bcrypt.genSalt(10);
    const lmsPasswordHash = await bcrypt.hash('password', salt);
    const adminApexHash = await bcrypt.hash('Admin@123', salt);
    const instructorApexHash = await bcrypt.hash('Instructor@123', salt);
    const studentApexHash = await bcrypt.hash('Student@123', salt);

    // Create @lms.com users
    const adminLms = await User.create({
      name: 'Alex Admin',
      email: 'admin@lms.com',
      passwordHash: lmsPasswordHash,
      role: 'admin',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
    });

    const instructorLms = await User.create({
      name: 'Dr. Sarah Carter',
      email: 'instructor@lms.com',
      passwordHash: lmsPasswordHash,
      role: 'instructor',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    });

    const studentLms = await User.create({
      name: 'Jane Doe',
      email: 'student@lms.com',
      passwordHash: lmsPasswordHash,
      role: 'student',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane',
    });

    // Create @apex.com users
    const adminApex = await User.create({
      name: 'Admin User',
      email: 'admin@apex.com',
      passwordHash: adminApexHash,
      role: 'admin',
      avatarUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=Admin',
    });

    const instructorApex = await User.create({
      name: 'Dr. Sarah Chen',
      email: 'instructor@apex.com',
      passwordHash: instructorApexHash,
      role: 'instructor',
      avatarUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=SarahChen',
    });

    const studentApex = await User.create({
      name: 'Alex Johnson',
      email: 'student@apex.com',
      passwordHash: studentApexHash,
      role: 'student',
      avatarUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=Alex',
    });

    console.log('✅ Demo credentials successfully seeded.');

    // Define all courses to seed
    const coursesToSeed = [
      {
        title: 'Mastering Next.js & React Server Components',
        subtitle: 'Build high-performance, enterprise-grade React applications.',
        description: 'Learn to build high-performance, enterprise-grade React applications using the Next.js App Router, Server Components, Server Actions, and advanced caching layers.',
        instructor: instructorLms._id,
        category: 'Frontend Development',
        level: 'advanced' as const,
        thumbnailUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=640&auto=format&fit=crop',
        tags: ['React', 'Next.js', 'TypeScript', 'Tailwind'],
        status: 'published' as const,
        modules: [
          {
            title: 'Introduction to Server-First Paradigms',
            order: 1,
            lessons: [
              {
                title: 'React Server Components vs. Client Components',
                description: 'Detailed look at component life cycles, SSR vs RSC, and network boundary principles.',
                type: 'video' as const,
                videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-software-developer-working-on-his-computer-34289-large.mp4',
                duration: 12,
                order: 1,
              },
              {
                title: 'Thinking in Server Component Architectures',
                description: 'Understand when to leverage server components vs client components.',
                type: 'text' as const,
                content: `React Server Components (RSC) represent a major shift in how we think about React rendering. By default, components in Next.js App Router are Server Components.

Key benefits of Server Components:
1. Smaller Bundle Size: Dependency libraries used in Server Components are not sent to the client.
2. Direct Database Access: You can fetch data directly from databases or backend services using standard async/await.
3. Enhanced Security: Keep API tokens, credentials, and sensitive algorithms safe on the server.
4. Better SEO: Pre-rendered HTML is served directly to crawlers.

When to switch to Client Components ('use client'):
- Interactivity: Using event handlers like onClick(), onChange().
- Client State & Hooks: useState(), useReducer(), useEffect().
- Browser APIs: window, localStorage, geolocation.`,
                duration: 8,
                order: 2,
              }
            ]
          },
          {
            title: 'State Management and Mutation',
            order: 2,
            lessons: [
              {
                title: 'Understanding React Server Actions',
                description: 'Learn how to mutate data directly on the server without REST endpoints.',
                type: 'video' as const,
                videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-monitor-screen-of-a-developer-running-code-41873-large.mp4',
                duration: 15,
                order: 1,
              },
              {
                title: 'Caching & Data Revalidation Guide',
                description: 'A cheat sheet containing cache-tag strategies, force-cache options, and router state rules.',
                type: 'pdf' as const,
                pdfUrl: 'https://pdfobject.com/pdf/sample.pdf',
                duration: 10,
                order: 2,
              }
            ],
            quiz: {
              title: 'Next.js RSC & State Assessment',
              description: 'Validate your grasp of Server Boundaries, Server Actions, and Next.js caching rules.',
              passingScore: 70,
              questions: [
                {
                  questionText: 'Where do React Server Components execute?',
                  options: [
                    'Only in the browser',
                    'Only on the server',
                    'Both client and server',
                    'In a service worker',
                  ],
                  correctAnswerIndex: 1,
                  explanation: 'React Server Components execute strictly on the server side and transmit structured JSON representations (RSC payload) to the browser.',
                },
                {
                  questionText: "Which directive is used to mark a file boundary as containing client-only interactivity?",
                  options: [
                    '"use client"',
                    '"use client side"',
                    '"client component"',
                    '"use react"',
                  ],
                  correctAnswerIndex: 0,
                  explanation: 'Adding the "use client" directive at the top of a file declares a boundary between server and client module graphs.',
                },
                {
                  questionText: 'What happens to the JavaScript bundle size when you use server-only components?',
                  options: [
                    'It increases slightly',
                    'It remains completely unaffected',
                    'It decreases because RSC libraries are not sent to the client browser',
                    'It doubles in size due to double caching',
                  ],
                  correctAnswerIndex: 2,
                  explanation: 'Since Server Components execute only on the server, their dependencies are kept server-side, reducing client-side JavaScript bundles.',
                },
              ],
            }
          }
        ]
      },
      {
        title: 'Advanced Distributed Systems & Microservices Architecture',
        subtitle: 'Architect resilient distributed backend systems.',
        description: 'Architect resilient, highly scalable distributed backends. Implement event-driven architectures, service mesh configuration, load balancing, and consensus protocols.',
        instructor: instructorLms._id,
        category: 'Software Engineering',
        level: 'advanced' as const,
        thumbnailUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=640&auto=format&fit=crop',
        tags: ['Microservices', 'Docker', 'Kubernetes', 'Distributed Systems'],
        status: 'published' as const,
        modules: [
          {
            title: 'Foundational Distributed Concepts',
            order: 1,
            lessons: [
              {
                title: 'The CAP Theorem in Practice',
                description: 'A rigorous review of Consistency, Availability, and Partition Tolerance in high-throughput clusters.',
                type: 'video' as const,
                videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-software-developer-working-on-his-computer-34289-large.mp4',
                duration: 18,
                order: 1,
              },
              {
                title: 'Consensus Mechanisms: Raft vs. Paxos',
                description: 'Deep dive into raft leader elections, heartbeats, and log replication rules.',
                type: 'text' as const,
                content: `Distributed consensus is a foundational concept. The raft algorithm is modern, understandable, and widely adopted (e.g. in Consul, etcd).

Raft decomposes consensus into three subproblems:
1. Leader Election: A single active leader processes client writes. If the leader fails, a candidate triggers an election and gains majority votes.
2. Log Replication: The leader takes writes, writes them to its log, and replicates them to followers. Once a majority acknowledges, it commits.
3. Safety: If a follower has a more up-to-date log than a candidate, the follower rejects the candidate's vote, ensuring that committed entries are never overwritten.`,
                duration: 12,
                order: 2,
              }
            ],
            quiz: {
              title: 'Distributed Systems Foundations Quiz',
              description: 'Test your understanding of CAP, PACELC, and database sharding techniques.',
              passingScore: 70,
              questions: [
                {
                  questionText: 'What does the P stand for in CAP theorem?',
                  options: [
                    'Performance',
                    'Partition Tolerance',
                    'Persistence',
                    'Privacy',
                  ],
                  correctAnswerIndex: 1,
                  explanation: 'The CAP theorem states that a distributed data store can simultaneously provide at most two out of three guarantees: Consistency, Availability, and Partition Tolerance (P).',
                },
                {
                  questionText: 'According to PACELC, if there is NO partition (E), what trade-off must a system make?',
                  options: [
                    'Latency (L) vs Consistency (C)',
                    'Availability (A) vs Consistency (C)',
                    'Security vs Cost',
                    'Speed vs Size',
                  ],
                  correctAnswerIndex: 0,
                  explanation: 'PACELC states that in the absence of partitions (E), the system must choose between Latency (L) and Consistency (C).',
                },
              ],
            }
          }
        ]
      },
      {
        title: 'Introduction to Cloud-Native DevOps',
        subtitle: 'Unlock the power of Docker, Kubernetes, CI/CD pipelines, and cloud monitoring.',
        description: 'A beginner-friendly entry into the DevOps space. Learn containerization isolation, multi-stage compilation, Kubernetes orchestration architectures, and Prometheus telemetry metrics tracking.',
        instructor: instructorLms._id,
        category: 'DevOps',
        level: 'beginner' as const,
        thumbnailUrl: 'https://images.unsplash.com/photo-1600132806370-bf17e65e942f?q=80&w=640&auto=format&fit=crop',
        tags: ['Docker', 'Kubernetes', 'Cloud', 'DevOps'],
        status: 'published' as const,
        modules: [
          {
            title: 'Containerization Foundations',
            order: 1,
            lessons: [
              {
                title: 'Understanding Container Namespaces & Cgroups',
                description: 'Deconstructing underlying linux primitives that enable containerization.',
                type: 'video' as const,
                videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-monitor-screen-of-a-developer-running-code-41873-large.mp4',
                duration: 20,
                order: 1,
              },
              {
                title: 'Efficient Multi-Stage Dockerfile Compilation',
                description: 'Minimizing image size and hardening security parameters.',
                type: 'text' as const,
                content: `Step-by-step documentation on decoupling build nodes from release binaries. We compile clean Next.js/Express builds and serve them inside hardened non-root containers.`,
                duration: 11,
                order: 2,
              }
            ],
            quiz: {
              title: 'Cloud-Native Containerization Assessment',
              description: 'Validate your grasp of Docker isolation, cgroups, and namespaces.',
              passingScore: 70,
              questions: [
                {
                  questionText: 'Which kernel primitive limits the resource utilization (CPU, memory) of a container?',
                  options: [
                    'Namespaces',
                    'Control Groups (cgroups)',
                    'Chroot',
                    'UnionFS',
                  ],
                  correctAnswerIndex: 1,
                  explanation: 'Control groups (cgroups) are a Linux kernel feature that limits, accounts for, and isolates the resource usage of a collection of processes.',
                },
                {
                  questionText: 'What is the primary benefit of multi-stage Docker builds?',
                  options: [
                    'Caching build logs',
                    'Faster local dev runs',
                    'Smaller production image sizes by separating compile-time dependencies',
                    'Avoiding Docker configurations entirely',
                  ],
                  correctAnswerIndex: 2,
                  explanation: 'Multi-stage builds permit you to compile your code in an intermediate image containing compile-time tools, and copy only the final release binary to a tiny release-only image.',
                },
              ],
            }
          }
        ]
      },
      {
        title: 'System Design Mastery',
        subtitle: 'Build scalable distributed systems like the engineers at FAANG',
        description: 'A comprehensive deep-dive into distributed systems, microservices, event sourcing, CQRS, and cloud-native architectures. Build systems that handle millions of requests.',
        instructor: instructorApex._id,
        category: 'Software Engineering',
        level: 'advanced' as const,
        thumbnailUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600',
        tags: ['System Design', 'Distributed Systems', 'Cloud', 'FAANG Prep'],
        status: 'published' as const,
        modules: [
          {
            title: 'High Availability Configurations',
            order: 1,
            lessons: [
              {
                title: 'Decoupling REST Controller Abstractions',
                description: 'Isolate database handlers from HTTP request wrappers.',
                type: 'text' as const,
                content: 'To build clean API routes, always inject repositories into services, keeping express controllers thin.',
                duration: 15,
                order: 1,
              },
              {
                title: 'Setting up Event Sourcing Streams',
                description: 'Learn event-driven state mutations and message brokers.',
                type: 'video' as const,
                videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-software-developer-working-on-his-computer-34289-large.mp4',
                duration: 25,
                order: 2,
              }
            ]
          }
        ]
      },
      {
        title: 'Full-Stack TypeScript Engineering',
        subtitle: 'Production-grade React, Node.js, and PostgreSQL from zero to hero',
        description: 'Master TypeScript, React 18, Next.js 14, Node.js, Prisma, and PostgreSQL. Build a production SaaS application from scratch with CI/CD and deployment on AWS.',
        instructor: instructorApex._id,
        category: 'Frontend Development',
        level: 'intermediate' as const,
        thumbnailUrl: 'https://images.unsplash.com/photo-1555099962-4199c345e5dd?w=600',
        tags: ['TypeScript', 'React', 'Node.js', 'Full-Stack'],
        status: 'published' as const,
        modules: [
          {
            title: 'Introduction to Full-Stack Node',
            order: 1,
            lessons: [
              {
                title: 'TypeScript Compiler Options',
                description: 'Master strict compile rules and configuration parameters.',
                type: 'text' as const,
                content: 'Strict typechecking is critical for ensuring reliable software behaviors across backend systems.',
                duration: 12,
                order: 1,
              }
            ]
          }
        ]
      },
      {
        title: 'DevOps & Cloud Engineering',
        subtitle: 'Docker, Kubernetes, Terraform, AWS, and GitOps pipelines',
        description: 'Learn modern DevOps practices: containerization with Docker, orchestration with Kubernetes, infrastructure as code with Terraform, and CI/CD with GitHub Actions.',
        instructor: instructorApex._id,
        category: 'DevOps',
        level: 'intermediate' as const,
        thumbnailUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600',
        tags: ['Docker', 'Kubernetes', 'Terraform', 'AWS', 'CI/CD'],
        status: 'published' as const,
        modules: [
          {
            title: 'CI/CD and GitOps Pipelines',
            order: 1,
            lessons: [
              {
                title: 'Building Hardened Docker Containers',
                description: 'Minimize surface area vectors in runtime image layers.',
                type: 'video' as const,
                videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-monitor-screen-of-a-developer-running-code-41873-large.mp4',
                duration: 18,
                order: 1,
              }
            ]
          }
        ]
      }
    ];

    // Seed Courses, Modules, Lessons, Quizzes
    console.log('Seeding courses, modules, lessons, and quizzes...');
    
    // Store variables to link enrollments/progress later
    let course1NextJs: any = null;
    let course4SysDesign: any = null;
    let nextJsFirstLesson: any = null;
    let nextJsSecondLesson: any = null;
    let sysDesignFirstLesson: any = null;

    for (let cIdx = 0; cIdx < coursesToSeed.length; cIdx++) {
      const cData = coursesToSeed[cIdx];
      const { modules, ...courseFields } = cData;

      // Create Course
      const course = await Course.create(courseFields);
      console.log(`- Created course: "${course.title}"`);

      // Store specific courses to reference in enrollments
      if (cIdx === 0) course1NextJs = course;
      if (cIdx === 3) course4SysDesign = course;

      if (modules) {
        for (const mData of modules) {
          const { lessons, quiz, ...moduleFields } = mData as any;

          // Create Module
          const mod = await Module.create({
            ...moduleFields,
            course: course._id,
          });

          if (lessons) {
            for (const lData of lessons) {
              // Create Lesson
              const lesson = await Lesson.create({
                ...lData,
                module: mod._id,
                course: course._id,
              });

              // Keep track of specific lessons to pre-seed completion progress
              if (cIdx === 0 && lData.order === 1) nextJsFirstLesson = lesson;
              if (cIdx === 0 && lData.order === 2) nextJsSecondLesson = lesson;
              if (cIdx === 3 && lData.order === 1) sysDesignFirstLesson = lesson;
            }
          }

          if (quiz) {
            // Create Quiz
            await Quiz.create({
              ...quiz,
              course: course._id,
              module: mod._id,
            });
          }
        }
      }
    }

    // Seed Coding Problems
    console.log('Seeding coding problems...');
    await CodingProblem.create({
      title: 'Two Sum',
      description: `Given an array of integers \`nums\` and an integer \`target\`, return *indices of the two numbers such that they add up to \`target\`*.

You may assume that each input would have ***exactly* one solution**, and you may not use the *same* element twice.

You can return the answer in any order.

### Example 1:
\`\`\`
Input: nums = [2,7,11,15], target = 9
Output: [0,1]
Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].
\`\`\`
`,
      difficulty: 'easy',
      topicTags: ['Array', 'Hash Table'],
      starterTemplates: [
        {
          language: 'javascript',
          templateCode: `function twoSum(nums, target) {
  // Write your code here
  
}`,
        },
        {
          language: 'python',
          templateCode: `def two_sum(nums, target):
    # Write your code here
    pass`,
        }
      ],
      testCases: [
        { input: '[2,7,11,15], 9', expectedOutput: '[0,1]', isHidden: false },
        { input: '[3,2,4], 6', expectedOutput: '[1,2]', isHidden: false },
        { input: '[3,3], 6', expectedOutput: '[0,1]', isHidden: true }
      ],
      points: 100
    });

    // Seed Assignments
    console.log('Seeding assignments...');
    if (course1NextJs) {
      await Assignment.create({
        course: course1NextJs._id,
        module: nextJsSecondLesson ? nextJsSecondLesson.module : course1NextJs._id,
        title: 'Build a Serverless E-Commerce Workspace',
        description: `Deploy a production-ready Next.js App Router store utilizing:
1. React Server Components for SEO and fast loading catalog screens.
2. Server Actions for transactional shopping cart checkouts.
3. Hardened rate limiters and secure middleware layers.

### Deliverables:
- GitHub repository link containing a working multi-stage Dockerfile setup.
- Brief markdown report reviewing optimization and caching benchmarks.`,
        deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        rubric: [
          { criteria: 'RSC Boundary Isolation & Code Quality', maxPoints: 40 },
          { criteria: 'Server Actions Transaction Security', maxPoints: 30 },
          { criteria: 'Docker Containerization & Setup', maxPoints: 30 }
        ],
        maxPoints: 100
      });
    }

    // Seed student enrollments and progress (completed lessons)
    console.log('Seeding default student enrollments and progress logs...');

    // 1. student@lms.com enrolled in Next.js course
    if (studentLms && course1NextJs) {
      await Enrollment.create({
        student: studentLms._id,
        course: course1NextJs._id,
        progressPercentage: 50,
      });

      await Course.findByIdAndUpdate(course1NextJs._id, {
        $addToSet: { studentsEnrolled: studentLms._id },
      });

      if (nextJsFirstLesson) {
        await Progress.create({
          student: studentLms._id,
          course: course1NextJs._id,
          lesson: nextJsFirstLesson._id,
          isCompleted: true,
        });
      }

      if (nextJsSecondLesson) {
        await Progress.create({
          student: studentLms._id,
          course: course1NextJs._id,
          lesson: nextJsSecondLesson._id,
          isCompleted: false,
          bookmark: true,
        });
      }
    }

    // 2. student@apex.com enrolled in System Design course
    if (studentApex && course4SysDesign) {
      await Enrollment.create({
        student: studentApex._id,
        course: course4SysDesign._id,
        progressPercentage: 50,
      });

      await Course.findByIdAndUpdate(course4SysDesign._id, {
        $addToSet: { studentsEnrolled: studentApex._id },
      });

      if (sysDesignFirstLesson) {
        await Progress.create({
          student: studentApex._id,
          course: course4SysDesign._id,
          lesson: sysDesignFirstLesson._id,
          isCompleted: true,
        });
      }
    }

    console.log('✅ Seeding process completed successfully!');
  } catch (error: any) {
    console.error('⚠️ Seeding encountered an error:', error);
  }
};

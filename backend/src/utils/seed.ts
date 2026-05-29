import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

import { User } from '../models/User';
import { Course } from '../models/Course';
import { Module } from '../models/Module';
import { Lesson } from '../models/Lesson';
import { Quiz } from '../models/Quiz';
import { Enrollment } from '../models/Enrollment';
import { Progress } from '../models/Progress';
import { QuizAttempt } from '../models/QuizAttempt';
import { CodingProblem } from '../models/CodingProblem';
import { CodeSubmission } from '../models/CodeSubmission';
import { Assignment } from '../models/Assignment';
import { Submission } from '../models/Submission';
import { Discussion } from '../models/Discussion';
import { Achievement } from '../models/Achievement';
import { Notification } from '../models/Notification';

const seedDatabase = async () => {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/enterprise_lms';
  
  console.log('Connecting to database for seeding...');
  await mongoose.connect(mongoUri);
  console.log('Connected to MongoDB.');

  // Clean collections
  console.log('Cleaning existing records...');
  await User.deleteMany({});
  await Course.deleteMany({});
  await Module.deleteMany({});
  await Lesson.deleteMany({});
  await Quiz.deleteMany({});
  await Enrollment.deleteMany({});
  await Progress.deleteMany({});
  await QuizAttempt.deleteMany({});
  await CodingProblem.deleteMany({});
  await CodeSubmission.deleteMany({});
  await Assignment.deleteMany({});
  await Submission.deleteMany({});
  await Discussion.deleteMany({});
  await Achievement.deleteMany({});
  await Notification.deleteMany({});
  console.log('Collections cleared.');

  // Create Users
  console.log('Hashing passwords...');
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('password', salt);

  console.log('Creating users...');
  const admin = await User.create({
    name: 'Alex Admin',
    email: 'admin@lms.com',
    passwordHash,
    role: 'admin',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
  });

  const instructor = await User.create({
    name: 'Dr. Sarah Carter',
    email: 'instructor@lms.com',
    passwordHash,
    role: 'instructor',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
  });

  const student = await User.create({
    name: 'Jane Doe',
    email: 'student@lms.com',
    passwordHash,
    role: 'student',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane',
  });

  console.log(`Created users:\n- Admin: ${admin.email}\n- Instructor: ${instructor.email}\n- Student: ${student.email}`);

  // Create Course 1
  console.log('Creating Course 1...');
  const course1 = await Course.create({
    title: 'Mastering Next.js & React Server Components',
    subtitle: 'Build high-performance, enterprise-grade React applications.',
    description: 'Learn to build high-performance, enterprise-grade React applications using the Next.js App Router, Server Components, Server Actions, and advanced caching layers.',
    instructor: instructor._id,
    category: 'Web Development',
    level: 'advanced',
    thumbnailUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=640&auto=format&fit=crop',
    tags: ['React', 'Next.js', 'TypeScript', 'Tailwind'],
    status: 'published',
  });

  // Course 1 - Module 1
  const c1m1 = await Module.create({
    course: course1._id,
    title: 'Introduction to Server-First Paradigms',
    order: 1,
  });

  const c1m1l1 = await Lesson.create({
    module: c1m1._id,
    course: course1._id,
    title: 'React Server Components vs. Client Components',
    description: 'Detailed look at component life cycles, SSR vs RSC, and network boundary principles.',
    type: 'video',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-software-developer-working-on-his-computer-34289-large.mp4',
    duration: 12,
    order: 1,
  });

  const c1m1l2 = await Lesson.create({
    module: c1m1._id,
    course: course1._id,
    title: 'Thinking in Server Component Architectures',
    description: 'Understand when to leverage server components vs client components.',
    type: 'text',
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
  });

  // Course 1 - Module 2
  const c1m2 = await Module.create({
    course: course1._id,
    title: 'State Management and Mutation',
    order: 2,
  });

  const c1m2l1 = await Lesson.create({
    module: c1m2._id,
    course: course1._id,
    title: 'Understanding React Server Actions',
    description: 'Learn how to mutate data directly on the server without REST endpoints.',
    type: 'video',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-monitor-screen-of-a-developer-running-code-41873-large.mp4',
    duration: 15,
    order: 1,
  });

  const c1m2l2 = await Lesson.create({
    module: c1m2._id,
    course: course1._id,
    title: 'Caching & Data Revalidation Guide',
    description: 'A cheat sheet containing cache-tag strategies, force-cache options, and router state rules.',
    type: 'pdf',
    pdfUrl: 'https://pdfobject.com/pdf/sample.pdf',
    duration: 10,
    order: 2,
  });

  // Quiz for Course 1 - Module 2
  await Quiz.create({
    course: course1._id,
    module: c1m2._id,
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
  });

  // Create Course 2
  console.log('Creating Course 2...');
  const course2 = await Course.create({
    title: 'Advanced Distributed Systems & Microservices Architecture',
    subtitle: 'Architect resilient distributed backend systems.',
    description: 'Architect resilient, highly scalable distributed backends. Implement event-driven architectures, service mesh configuration, load balancing, and consensus protocols.',
    instructor: instructor._id,
    category: 'Software Engineering',
    level: 'advanced',
    thumbnailUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=640&auto=format&fit=crop',
    tags: ['Microservices', 'Docker', 'Kubernetes', 'Distributed Systems'],
    status: 'published',
  });

  // Course 2 - Module 1
  const c2m1 = await Module.create({
    course: course2._id,
    title: 'Foundational Distributed Concepts',
    order: 1,
  });

  const c2m1l1 = await Lesson.create({
    module: c2m1._id,
    course: course2._id,
    title: 'The CAP Theorem in Practice',
    description: 'A rigorous review of Consistency, Availability, and Partition Tolerance in high-throughput clusters.',
    type: 'video',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-software-developer-working-on-his-computer-34289-large.mp4',
    duration: 18,
    order: 1,
  });

  const c2m1l2 = await Lesson.create({
    module: c2m1._id,
    course: course2._id,
    title: 'Consensus Mechanisms: Raft vs. Paxos',
    description: 'Deep dive into raft leader elections, heartbeats, and log replication rules.',
    type: 'text',
    content: `Distributed consensus is a foundational concept. The raft algorithm is modern, understandable, and widely adopted (e.g. in Consul, etcd).

Raft decomposes consensus into three subproblems:
1. Leader Election: A single active leader processes client writes. If the leader fails, a candidate triggers an election and gains majority votes.
2. Log Replication: The leader takes writes, writes them to its log, and replicates them to followers. Once a majority acknowledges, it commits.
3. Safety: If a follower has a more up-to-date log than a candidate, the follower rejects the candidate's vote, ensuring that committed entries are never overwritten.`,
    duration: 12,
    order: 2,
  });

  // Quiz for Course 2
  await Quiz.create({
    course: course2._id,
    module: c2m1._id,
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
  });

  // Create Course 3
  console.log('Creating Course 3...');
  const course3 = await Course.create({
    title: 'Introduction to Cloud-Native DevOps',
    subtitle: 'Unlock the power of Docker, Kubernetes, CI/CD pipelines, and cloud monitoring.',
    description: 'A beginner-friendly entry into the DevOps space. Learn containerization isolation, multi-stage compilation, Kubernetes orchestration architectures, and Prometheus telemetry metrics tracking.',
    instructor: instructor._id,
    category: 'DevOps',
    level: 'beginner',
    thumbnailUrl: 'https://images.unsplash.com/photo-1600132806370-bf17e65e942f?q=80&w=640&auto=format&fit=crop',
    tags: ['Docker', 'Kubernetes', 'Cloud', 'DevOps'],
    status: 'published',
  });

  // Course 3 - Module 1
  const c3m1 = await Module.create({
    course: course3._id,
    title: 'Containerization Foundations',
    order: 1,
  });

  await Lesson.create({
    module: c3m1._id,
    course: course3._id,
    title: 'Understanding Container Namespaces & Cgroups',
    description: 'Deconstructing underlying linux primitives that enable containerization.',
    type: 'video',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-monitor-screen-of-a-developer-running-code-41873-large.mp4',
    duration: 20,
    order: 1,
  });

  await Lesson.create({
    module: c3m1._id,
    course: course3._id,
    title: 'Efficient Multi-Stage Dockerfile Compilation',
    description: 'Minimizing image size and hardening security parameters.',
    type: 'text',
    content: `Step-by-step documentation on decoupling build nodes from release binaries. We compile clean Next.js/Express builds and serve them inside hardened non-root containers.`,
    duration: 11,
    order: 2,
  });

  // Course 3 - Module 2
  const c3m2 = await Module.create({
    course: course3._id,
    title: 'Orchestration with Kubernetes',
    order: 2,
  });

  await Lesson.create({
    module: c3m2._id,
    course: course3._id,
    title: 'Kubernetes Cluster Anatomy & Architecture',
    description: 'Master control planes, worker nodes, Kube-Proxy, and ETCD state logs.',
    type: 'pdf',
    pdfUrl: 'https://pdfobject.com/pdf/sample.pdf',
    duration: 25,
    order: 1,
  });

  // Quiz for Course 3
  await Quiz.create({
    course: course3._id,
    module: c3m1._id,
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
  });

  // Create Coding Problems
  console.log('Creating Coding Problems...');
  const problem1 = await CodingProblem.create({
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

  // Create Assignments
  console.log('Creating Course Assignments...');
  const assignment1 = await Assignment.create({
    course: course1._id,
    module: c1m2._id,
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

  // Create an enrollment and some progress for the student in Course 1
  console.log('Creating sample enrollment for Student...');
  const enrollment = await Enrollment.create({
    student: student._id,
    course: course1._id,
    progressPercentage: 25,
  });

  await Progress.create({
    student: student._id,
    course: course1._id,
    lesson: c1m1l1._id,
    isCompleted: true,
  });

  await Progress.create({
    student: student._id,
    course: course1._id,
    lesson: c1m1l2._id,
    isCompleted: false,
    bookmark: true,
  });

  console.log('Seeding process completed successfully!');
  await mongoose.connection.close();
  console.log('Database connection closed.');
};

seedDatabase().catch((err) => {
  console.error('Seeding encountered an error:', err);
  process.exit(1);
});


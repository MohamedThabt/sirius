// Mock AI generation for DBML database schemas
export const generateDBMLSchema = (prompt: string): string => {
    const lowerPrompt = prompt.toLowerCase();

    // E-commerce system
    if (
        lowerPrompt.includes('ecommerce') ||
        lowerPrompt.includes('e-commerce') ||
        lowerPrompt.includes('shopping') ||
        lowerPrompt.includes('store')
    ) {
        return `// E-Commerce Database Schema
// Generated based on: ${prompt}

Table users {
  id integer [pk, increment]
  username varchar(50) [unique, not null]
  email varchar(100) [unique, not null]
  password_hash varchar(255) [not null]
  first_name varchar(50)
  last_name varchar(50)
  phone varchar(20)
  date_of_birth date
  is_active boolean [default: true]
  created_at timestamp [default: 'now()']
  updated_at timestamp [default: 'now()']
}

Table categories {
  id integer [pk, increment]
  name varchar(100) [not null]
  description text
  slug varchar(100) [unique, not null]
  parent_id integer [ref: > categories.id]
  is_active boolean [default: true]
  created_at timestamp [default: 'now()']
}

Table products {
  id integer [pk, increment]
  name varchar(200) [not null]
  description text
  short_description varchar(500)
  sku varchar(50) [unique, not null]
  price decimal(10,2) [not null]
  compare_price decimal(10,2)
  cost_price decimal(10,2)
  stock_quantity integer [default: 0]
  min_stock_level integer [default: 0]
  weight decimal(8,2)
  dimensions varchar(50)
  category_id integer [ref: > categories.id]
  brand varchar(100)
  is_active boolean [default: true]
  is_featured boolean [default: false]
  created_at timestamp [default: 'now()']
  updated_at timestamp [default: 'now()']
}

Table product_images {
  id integer [pk, increment]
  product_id integer [ref: > products.id]
  image_url varchar(500) [not null]
  alt_text varchar(200)
  sort_order integer [default: 0]
  is_primary boolean [default: false]
}

Table orders {
  id integer [pk, increment]
  order_number varchar(50) [unique, not null]
  user_id integer [ref: > users.id]
  status varchar(20) [default: 'pending']
  payment_status varchar(20) [default: 'pending']
  shipping_status varchar(20) [default: 'pending']
  subtotal decimal(10,2) [not null]
  tax_amount decimal(10,2) [default: 0]
  shipping_amount decimal(10,2) [default: 0]
  discount_amount decimal(10,2) [default: 0]
  total_amount decimal(10,2) [not null]
  currency varchar(3) [default: 'USD']
  shipping_address text
  billing_address text
  notes text
  created_at timestamp [default: 'now()']
  updated_at timestamp [default: 'now()']
}

Table order_items {
  id integer [pk, increment]
  order_id integer [ref: > orders.id]
  product_id integer [ref: > products.id]
  quantity integer [not null]
  unit_price decimal(10,2) [not null]
  total_price decimal(10,2) [not null]
  product_snapshot json
}

Table reviews {
  id integer [pk, increment]
  user_id integer [ref: > users.id]
  product_id integer [ref: > products.id]
  order_id integer [ref: > orders.id]
  rating integer [not null, note: '1-5 stars']
  title varchar(200)
  comment text
  is_verified boolean [default: false]
  is_approved boolean [default: false]
  created_at timestamp [default: 'now()']
}

Table cart_items {
  id integer [pk, increment]
  user_id integer [ref: > users.id]
  product_id integer [ref: > products.id]
  quantity integer [not null]
  created_at timestamp [default: 'now()']
  updated_at timestamp [default: 'now()']
}

// Relationships
Ref: order_items.order_id > orders.id
Ref: order_items.product_id > products.id
Ref: reviews.user_id > users.id
Ref: reviews.product_id > products.id
Ref: reviews.order_id > orders.id
Ref: cart_items.user_id > users.id
Ref: cart_items.product_id > products.id
Ref: product_images.product_id > products.id`;
    }

    // Blog system
    if (lowerPrompt.includes('blog') || lowerPrompt.includes('cms') || lowerPrompt.includes('content') || lowerPrompt.includes('post')) {
        return `// Blog/CMS Database Schema
// Generated based on: ${prompt}

Table users {
  id integer [pk, increment]
  username varchar(50) [unique, not null]
  email varchar(100) [unique, not null]
  password_hash varchar(255) [not null]
  first_name varchar(50)
  last_name varchar(50)
  bio text
  avatar_url varchar(500)
  role varchar(20) [default: 'author', note: 'admin, editor, author, subscriber']
  is_active boolean [default: true]
  created_at timestamp [default: 'now()']
  updated_at timestamp [default: 'now()']
}

Table categories {
  id integer [pk, increment]
  name varchar(100) [not null]
  slug varchar(100) [unique, not null]
  description text
  color varchar(7) [note: 'Hex color code']
  parent_id integer [ref: > categories.id]
  is_active boolean [default: true]
  created_at timestamp [default: 'now()']
}

Table tags {
  id integer [pk, increment]
  name varchar(50) [unique, not null]
  slug varchar(50) [unique, not null]
  description text
  color varchar(7) [note: 'Hex color code']
  created_at timestamp [default: 'now()']
}

Table posts {
  id integer [pk, increment]
  title varchar(200) [not null]
  slug varchar(200) [unique, not null]
  excerpt text
  content text [not null]
  featured_image varchar(500)
  status varchar(20) [default: 'draft', note: 'draft, published, archived']
  visibility varchar(20) [default: 'public', note: 'public, private, password']
  password varchar(100)
  author_id integer [ref: > users.id]
  category_id integer [ref: > categories.id]
  view_count integer [default: 0]
  comment_count integer [default: 0]
  is_featured boolean [default: false]
  is_sticky boolean [default: false]
  published_at timestamp
  created_at timestamp [default: 'now()']
  updated_at timestamp [default: 'now()']
}

Table post_tags {
  id integer [pk, increment]
  post_id integer [ref: > posts.id]
  tag_id integer [ref: > tags.id]
}

Table comments {
  id integer [pk, increment]
  post_id integer [ref: > posts.id]
  author_name varchar(100) [not null]
  author_email varchar(100) [not null]
  author_url varchar(200)
  content text [not null]
  status varchar(20) [default: 'pending', note: 'pending, approved, spam, trash']
  parent_id integer [ref: > comments.id]
  user_id integer [ref: > users.id]
  ip_address varchar(45)
  user_agent text
  created_at timestamp [default: 'now()']
  updated_at timestamp [default: 'now()']
}

Table media {
  id integer [pk, increment]
  filename varchar(200) [not null]
  original_name varchar(200) [not null]
  mime_type varchar(100) [not null]
  file_size integer [not null]
  file_path varchar(500) [not null]
  alt_text varchar(200)
  caption text
  uploaded_by integer [ref: > users.id]
  created_at timestamp [default: 'now()']
}

// Relationships
Ref: post_tags.post_id > posts.id
Ref: post_tags.tag_id > tags.id
Ref: comments.post_id > posts.id
Ref: comments.parent_id > comments.id
Ref: comments.user_id > users.id
Ref: media.uploaded_by > users.id`;
    }

    // Social media platform
    if (lowerPrompt.includes('social') || lowerPrompt.includes('network') || lowerPrompt.includes('community') || lowerPrompt.includes('feed')) {
        return `// Social Media Platform Database Schema
// Generated based on: ${prompt}

Table users {
  id integer [pk, increment]
  username varchar(50) [unique, not null]
  email varchar(100) [unique, not null]
  password_hash varchar(255) [not null]
  first_name varchar(50)
  last_name varchar(50)
  bio text
  avatar_url varchar(500)
  cover_image_url varchar(500)
  location varchar(100)
  website varchar(200)
  date_of_birth date
  is_verified boolean [default: false]
  is_active boolean [default: true]
  privacy_settings json [note: 'Privacy preferences']
  created_at timestamp [default: 'now()']
  updated_at timestamp [default: 'now()']
}

Table posts {
  id integer [pk, increment]
  user_id integer [ref: > users.id]
  content text [not null]
  media_urls json [note: 'Array of media URLs']
  post_type varchar(20) [default: 'text', note: 'text, image, video, link']
  visibility varchar(20) [default: 'public', note: 'public, friends, private']
  location varchar(100)
  is_pinned boolean [default: false]
  like_count integer [default: 0]
  comment_count integer [default: 0]
  share_count integer [default: 0]
  created_at timestamp [default: 'now()']
  updated_at timestamp [default: 'now()']
}

Table comments {
  id integer [pk, increment]
  post_id integer [ref: > posts.id]
  user_id integer [ref: > users.id]
  content text [not null]
  parent_id integer [ref: > comments.id]
  like_count integer [default: 0]
  created_at timestamp [default: 'now()']
  updated_at timestamp [default: 'now()']
}

Table likes {
  id integer [pk, increment]
  user_id integer [ref: > users.id]
  post_id integer [ref: > posts.id]
  comment_id integer [ref: > comments.id]
  created_at timestamp [default: 'now()']
}

Table follows {
  id integer [pk, increment]
  follower_id integer [ref: > users.id]
  following_id integer [ref: > users.id]
  created_at timestamp [default: 'now()']
}

Table messages {
  id integer [pk, increment]
  sender_id integer [ref: > users.id]
  receiver_id integer [ref: > users.id]
  content text [not null]
  message_type varchar(20) [default: 'text', note: 'text, image, file']
  is_read boolean [default: false]
  created_at timestamp [default: 'now()']
}

Table notifications {
  id integer [pk, increment]
  user_id integer [ref: > users.id]
  type varchar(50) [not null, note: 'like, comment, follow, message']
  title varchar(200) [not null]
  message text
  data json [note: 'Additional notification data']
  is_read boolean [default: false]
  created_at timestamp [default: 'now()']
}

// Relationships
Ref: comments.post_id > posts.id
Ref: comments.user_id > users.id
Ref: comments.parent_id > comments.id
Ref: likes.user_id > users.id
Ref: likes.post_id > posts.id
Ref: likes.comment_id > comments.id
Ref: follows.follower_id > users.id
Ref: follows.following_id > users.id
Ref: messages.sender_id > users.id
Ref: messages.receiver_id > users.id
Ref: notifications.user_id > users.id`;
    }

    // Project management system
    if (lowerPrompt.includes('project') || lowerPrompt.includes('task') || lowerPrompt.includes('management') || lowerPrompt.includes('kanban')) {
        return `// Project Management System Database Schema
// Generated based on: ${prompt}

Table users {
  id integer [pk, increment]
  username varchar(50) [unique, not null]
  email varchar(100) [unique, not null]
  password_hash varchar(255) [not null]
  first_name varchar(50)
  last_name varchar(50]
  avatar_url varchar(500)
  role varchar(20) [default: 'member', note: 'admin, manager, member']
  is_active boolean [default: true]
  created_at timestamp [default: 'now()']
  updated_at timestamp [default: 'now()']
}

Table organizations {
  id integer [pk, increment]
  name varchar(200) [not null]
  description text
  logo_url varchar(500)
  settings json [note: 'Organization settings']
  created_at timestamp [default: 'now()']
  updated_at timestamp [default: 'now()']
}

Table projects {
  id integer [pk, increment]
  name varchar(200) [not null]
  description text
  status varchar(20) [default: 'active', note: 'active, completed, archived']
  priority varchar(20) [default: 'medium', note: 'low, medium, high, urgent']
  start_date date
  end_date date
  budget decimal(12,2)
  organization_id integer [ref: > organizations.id]
  owner_id integer [ref: > users.id]
  created_at timestamp [default: 'now()']
  updated_at timestamp [default: 'now()']
}

Table project_members {
  id integer [pk, increment]
  project_id integer [ref: > projects.id]
  user_id integer [ref: > users.id]
  role varchar(20) [default: 'member', note: 'owner, admin, member']
  joined_at timestamp [default: 'now()']
}

Table task_lists {
  id integer [pk, increment]
  project_id integer [ref: > projects.id]
  name varchar(200) [not null]
  description text
  position integer [default: 0]
  created_at timestamp [default: 'now()']
  updated_at timestamp [default: 'now()']
}

Table tasks {
  id integer [pk, increment]
  task_list_id integer [ref: > task_lists.id]
  title varchar(200) [not null]
  description text
  status varchar(20) [default: 'todo', note: 'todo, in_progress, review, done']
  priority varchar(20) [default: 'medium', note: 'low, medium, high, urgent']
  assignee_id integer [ref: > users.id]
  reporter_id integer [ref: > users.id]
  due_date timestamp
  estimated_hours decimal(5,2)
  actual_hours decimal(5,2)
  position integer [default: 0]
  created_at timestamp [default: 'now()']
  updated_at timestamp [default: 'now()']
}

Table task_comments {
  id integer [pk, increment]
  task_id integer [ref: > tasks.id]
  user_id integer [ref: > users.id]
  content text [not null]
  created_at timestamp [default: 'now()']
  updated_at timestamp [default: 'now()']
}

Table time_entries {
  id integer [pk, increment]
  task_id integer [ref: > tasks.id]
  user_id integer [ref: > users.id]
  description text
  hours decimal(5,2) [not null]
  date date [not null]
  created_at timestamp [default: 'now()']
  updated_at timestamp [default: 'now()']
}

// Relationships
Ref: project_members.project_id > projects.id
Ref: project_members.user_id > users.id
Ref: task_lists.project_id > projects.id
Ref: tasks.task_list_id > task_lists.id
Ref: tasks.assignee_id > users.id
Ref: tasks.reporter_id > users.id
Ref: task_comments.task_id > tasks.id
Ref: task_comments.user_id > users.id
Ref: time_entries.task_id > tasks.id
Ref: time_entries.user_id > users.id`;
    }

    // Learning management system
    if (lowerPrompt.includes('learning') || lowerPrompt.includes('education') || lowerPrompt.includes('course') || lowerPrompt.includes('student')) {
        return `// Learning Management System Database Schema
// Generated based on: ${prompt}

Table users {
  id integer [pk, increment]
  username varchar(50) [unique, not null]
  email varchar(100) [unique, not null]
  password_hash varchar(255) [not null]
  first_name varchar(50)
  last_name varchar(50)
  avatar_url varchar(500)
  role varchar(20) [default: 'student', note: 'admin, instructor, student']
  is_active boolean [default: true]
  created_at timestamp [default: 'now()']
  updated_at timestamp [default: 'now()']
}

Table courses {
  id integer [pk, increment]
  title varchar(200) [not null]
  description text
  short_description varchar(500)
  thumbnail_url varchar(500)
  status varchar(20) [default: 'draft', note: 'draft, published, archived']
  difficulty varchar(20) [default: 'beginner', note: 'beginner, intermediate, advanced']
  duration_hours integer
  price decimal(10,2) [default: 0]
  instructor_id integer [ref: > users.id]
  category varchar(100)
  tags json [note: 'Array of tags']
  created_at timestamp [default: 'now()']
  updated_at timestamp [default: 'now()']
}

Table course_enrollments {
  id integer [pk, increment]
  course_id integer [ref: > courses.id]
  student_id integer [ref: > users.id]
  enrollment_date timestamp [default: 'now()']
  completion_date timestamp
  progress_percentage decimal(5,2) [default: 0]
  status varchar(20) [default: 'active', note: 'active, completed, dropped']
}

Table lessons {
  id integer [pk, increment]
  course_id integer [ref: > courses.id]
  title varchar(200) [not null]
  description text
  content text
  video_url varchar(500)
  duration_minutes integer
  lesson_type varchar(20) [default: 'video', note: 'video, text, quiz, assignment']
  order_index integer [not null]
  is_free boolean [default: false]
  created_at timestamp [default: 'now()']
  updated_at timestamp [default: 'now()']
}

Table lesson_progress {
  id integer [pk, increment]
  lesson_id integer [ref: > lessons.id]
  student_id integer [ref: > users.id]
  is_completed boolean [default: false]
  completion_date timestamp
  time_spent_minutes integer [default: 0]
  last_position_seconds integer [default: 0]
  created_at timestamp [default: 'now()']
  updated_at timestamp [default: 'now()']
}

Table assignments {
  id integer [pk, increment]
  course_id integer [ref: > courses.id]
  title varchar(200) [not null]
  description text
  instructions text
  due_date timestamp
  max_points integer [default: 100]
  assignment_type varchar(20) [default: 'submission', note: 'submission, quiz, discussion']
  created_at timestamp [default: 'now()']
  updated_at timestamp [default: 'now()']
}

Table assignment_submissions {
  id integer [pk, increment]
  assignment_id integer [ref: > assignments.id]
  student_id integer [ref: > users.id]
  content text
  file_urls json [note: 'Array of file URLs']
  submission_date timestamp [default: 'now()']
  grade decimal(5,2)
  feedback text
  status varchar(20) [default: 'submitted', note: 'submitted, graded, returned']
}

Table quizzes {
  id integer [pk, increment]
  course_id integer [ref: > courses.id]
  title varchar(200) [not null]
  description text
  time_limit_minutes integer
  max_attempts integer [default: 1]
  passing_score integer [default: 70]
  is_published boolean [default: false]
  created_at timestamp [default: 'now()']
  updated_at timestamp [default: 'now()']
}

Table quiz_questions {
  id integer [pk, increment]
  quiz_id integer [ref: > quizzes.id]
  question_text text [not null]
  question_type varchar(20) [default: 'multiple_choice', note: 'multiple_choice, true_false, short_answer']
  options json [note: 'For multiple choice questions']
  correct_answer text
  points integer [default: 1]
  order_index integer [not null]
}

Table quiz_attempts {
  id integer [pk, increment]
  quiz_id integer [ref: > quizzes.id]
  student_id integer [ref: > users.id]
  attempt_number integer [not null]
  score decimal(5,2)
  time_taken_minutes integer
  started_at timestamp [default: 'now()']
  completed_at timestamp
  status varchar(20) [default: 'in_progress', note: 'in_progress, completed, abandoned']
}

// Relationships
Ref: course_enrollments.course_id > courses.id
Ref: course_enrollments.student_id > users.id
Ref: lessons.course_id > courses.id
Ref: lesson_progress.lesson_id > lessons.id
Ref: lesson_progress.student_id > users.id
Ref: assignments.course_id > courses.id
Ref: assignment_submissions.assignment_id > assignments.id
Ref: assignment_submissions.student_id > users.id
Ref: quizzes.course_id > courses.id
Ref: quiz_questions.quiz_id > quizzes.id
Ref: quiz_attempts.quiz_id > quizzes.id
Ref: quiz_attempts.student_id > users.id`;
    }

    // Default generic schema
    return `// Generic Database Schema
// Generated based on: ${prompt}

Table users {
  id integer [pk, increment]
  username varchar(50) [unique, not null]
  email varchar(100) [unique, not null]
  password_hash varchar(255) [not null]
  first_name varchar(50)
  last_name varchar(50)
  is_active boolean [default: true]
  created_at timestamp [default: 'now()']
  updated_at timestamp [default: 'now()']
}

Table categories {
  id integer [pk, increment]
  name varchar(100) [not null]
  description text
  parent_id integer [ref: > categories.id]
  is_active boolean [default: true]
  created_at timestamp [default: 'now()']
}

Table items {
  id integer [pk, increment]
  name varchar(200) [not null]
  description text
  category_id integer [ref: > categories.id]
  status varchar(20) [default: 'active']
  created_at timestamp [default: 'now()']
  updated_at timestamp [default: 'now()']
}

// Relationships
Ref: items.category_id > categories.id`;
};

// Sample templates for different scenarios
export const dbmlTemplates = {
    ecommerce: `// E-Commerce Database Schema
Table users {
  id integer [pk, increment]
  username varchar(50) [unique, not null]
  email varchar(100) [unique, not null]
  password_hash varchar(255) [not null]
  first_name varchar(50)
  last_name varchar(50)
  created_at timestamp [default: 'now()']
  updated_at timestamp [default: 'now()']
}

Table products {
  id integer [pk, increment]
  name varchar(200) [not null]
  description text
  price decimal(10,2) [not null]
  stock_quantity integer [default: 0]
  category_id integer [ref: > categories.id]
  created_at timestamp [default: 'now()']
  updated_at timestamp [default: 'now()']
}

Table categories {
  id integer [pk, increment]
  name varchar(100) [not null]
  description text
  parent_id integer [ref: > categories.id]
  created_at timestamp [default: 'now()']
}

Table orders {
  id integer [pk, increment]
  user_id integer [ref: > users.id]
  status varchar(20) [default: 'pending']
  total_amount decimal(10,2) [not null]
  shipping_address text
  created_at timestamp [default: 'now()']
  updated_at timestamp [default: 'now()']
}

Table order_items {
  id integer [pk, increment]
  order_id integer [ref: > orders.id]
  product_id integer [ref: > products.id]
  quantity integer [not null]
  unit_price decimal(10,2) [not null]
  total_price decimal(10,2) [not null]
}

// Relationships
Ref: order_items.order_id > orders.id
Ref: order_items.product_id > products.id`,

    blog: `// Blog/CMS Database Schema
Table users {
  id integer [pk, increment]
  username varchar(50) [unique, not null]
  email varchar(100) [unique, not null]
  password_hash varchar(255) [not null]
  first_name varchar(50)
  last_name varchar(50)
  role varchar(20) [default: 'author']
  created_at timestamp [default: 'now()']
  updated_at timestamp [default: 'now()']
}

Table categories {
  id integer [pk, increment]
  name varchar(100) [not null]
  slug varchar(100) [unique, not null]
  description text
  created_at timestamp [default: 'now()']
}

Table posts {
  id integer [pk, increment]
  title varchar(200) [not null]
  slug varchar(200) [unique, not null]
  content text [not null]
  excerpt text
  status varchar(20) [default: 'draft']
  author_id integer [ref: > users.id]
  category_id integer [ref: > categories.id]
  published_at timestamp
  created_at timestamp [default: 'now()']
  updated_at timestamp [default: 'now()']
}

Table comments {
  id integer [pk, increment]
  post_id integer [ref: > posts.id]
  author_name varchar(100) [not null]
  author_email varchar(100) [not null]
  content text [not null]
  status varchar(20) [default: 'pending']
  created_at timestamp [default: 'now()']
}

// Relationships
Ref: comments.post_id > posts.id`,

    social: `// Social Media Platform Database Schema
Table users {
  id integer [pk, increment]
  username varchar(50) [unique, not null]
  email varchar(100) [unique, not null]
  password_hash varchar(255) [not null]
  first_name varchar(50)
  last_name varchar(50)
  bio text
  avatar_url varchar(500)
  created_at timestamp [default: 'now()']
  updated_at timestamp [default: 'now()']
}

Table posts {
  id integer [pk, increment]
  user_id integer [ref: > users.id]
  content text [not null]
  visibility varchar(20) [default: 'public']
  like_count integer [default: 0]
  comment_count integer [default: 0]
  created_at timestamp [default: 'now()']
  updated_at timestamp [default: 'now()']
}

Table comments {
  id integer [pk, increment]
  post_id integer [ref: > posts.id]
  user_id integer [ref: > users.id]
  content text [not null]
  created_at timestamp [default: 'now()']
}

Table likes {
  id integer [pk, increment]
  user_id integer [ref: > users.id]
  post_id integer [ref: > posts.id]
  created_at timestamp [default: 'now()']
}

Table follows {
  id integer [pk, increment]
  follower_id integer [ref: > users.id]
  following_id integer [ref: > users.id]
  created_at timestamp [default: 'now()']
}

// Relationships
Ref: comments.post_id > posts.id
Ref: comments.user_id > users.id
Ref: likes.user_id > users.id
Ref: likes.post_id > posts.id
Ref: follows.follower_id > users.id
Ref: follows.following_id > users.id`,
};

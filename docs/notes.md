## To DO List

- create projects and users many-to-many to make users can collaborate in project

## Accounts

- moahmed@example.com
- password
  ##API
- DOCs:https://9qg5k77ktg.apidog.io/
- API invitation : https://app.apidog.com/invite/project?token=Ex9y6bmnf6_SaNCWZVBI_

### in ERD phase

- make lovable create clone for https://dbml.dbdiagram.io/ and make it work with erd mermaid and dbml and convert between them
- in fast api create 2 end point first to create (initiate diagram ) and the another one for edit it by user prompt (do this in all phases)
- always use dbml for represent diaram and export as mermaid and dbml
- create table for erd version and in feature table add id of the stable (confirmed version)
- in page of feature erd (editor ,prompt input, diagram , switch for mermaid and dbml and export and import)
- in project ERD page make it same copy of feature erd page but :
  - editor not work
  - no there prompt input
  - every table in editor has comment that mention to feature name or code

### in feature breakdown based on srs :

organize and order their priorities based on dendentcy

``` text

laravel/app/Http/Controllers/
├── Auth/ 
├── Settings/ 
├── Controller.php 
└── Project/
    ├── SystemOverviewController.php
    ├── ProjectController.php (for manage user projects)
    ├── Documentation/
    │ ├── PRDController.php (Product Requirements Document)
    │ ├── SRSController.php (Software Requirements Specification)
    │ └── SADController.php (Software Architecture Document)
    ├── Feature/
    │ ├── FeaturesController.php 
    │ ├── ERDController.php (
    │ ├── SequenceDiagramController.php 
    │ └── UserJourneyController.php 

```
--- 
## system brief

Traditional online learning platforms create passive consumption experiences that don't engage students effectively. We're developing this platform because active learning through collaboration and peer interaction leads to better retention and understanding. The current market lacks tools that facilitate meaningful student-to-student learning and real-time collaborative problem-solving in virtual environments.

Primary users are university students and professors in STEM fields who need collaborative learning tools for complex problem-solving. Secondary users include online course creators, corporate training departments, and adult learners in professional development programs. We're targeting institutions that want to improve engagement in remote and hybrid learning environments, particularly for subjects requiring group work and peer review.

Our platform transforms passive video consumption into active collaborative learning experiences. Students learn faster through peer interaction, real-time problem-solving sessions, and immediate feedback mechanisms. Educators get detailed analytics on student engagement and learning patterns, while institutions see improved course completion rates and student satisfaction scores compared to traditional LMS platforms.

Core functionality includes virtual whiteboards for collaborative problem-solving, breakout room management, peer review systems, and real-time code collaboration tools. Advanced features include AI-powered study group matching, automated assignment distribution, plagiarism detection, video recording with timestamped annotations, mobile learning apps, and integration with existing LMS platforms. The system will also include analytics dashboards, accessibility tools for disabled students, and multi-language support.
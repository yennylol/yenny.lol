document.addEventListener('DOMContentLoaded', async () => {
  // Populate profile information (ideally from an API, but hardcoded for now)
  // ...existing code...

  // Function to create a project element
  function createProjectElement(project) {
    const projectDiv = document.createElement('div');
    projectDiv.classList.add('project');
    projectDiv.innerHTML = `
      <h3>${project.title}</h3>
      <p>${project.description}</p>
      <a href="${project.link}" target="_blank">View Project</a>
    `;
    return projectDiv;
  }

  // Fetch projects and populate the project grid
  async function populateProjects() {
    const projectGrid = document.querySelector('#projects .project-grid');

    // Use the websim API to get the current user's posted projects
    try {
      let creatorUsername = (await window.websim.getCreatedBy()).username;
      let response = await fetch(`/api/v1/users/${creatorUsername}/projects?posted=true`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      let data = await response.json();
      console.log(data);

      if (data.projects && data.projects.data) {
        data.projects.data.forEach(projectData => {
          const project = projectData.project;
          const projectElement = createProjectElement({
            title: project.title || 'Untitled Project',
            description: project.description || 'No description provided',
            link: `https://websim.ai/p/${project.id}`
          });
          projectGrid.appendChild(projectElement);
        });
      } else {
        projectGrid.innerHTML = '<p>No projects found.</p>';
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      projectGrid.innerHTML = '<p>Failed to load projects.</p>';
    }
  }

  // Set the profile picture
  const avatarDiv = document.querySelector('.avatar');
  avatarDiv.innerHTML = `<img src="/scarface.jpg" alt="Profile Picture" style="width: 200px; height: 200px; border-radius: 50%;">`;

  await populateProjects();

  // Shuffle background videos
  const videos = ["/che - Pizza Time.mp4", "/prettifun - Light (Official Video).mp4"];
  let currentVideoIndex = 0;
  const backgroundVideo = document.querySelector('.background-video');

  function setNextVideo() {
    currentVideoIndex = (currentVideoIndex + 1) % videos.length;
    backgroundVideo.src = videos[currentVideoIndex];
    backgroundVideo.load();
  }

  backgroundVideo.addEventListener('ended', setNextVideo);
});

import { PrismaClient, UserRole, ProjectStatus, ProjectType, ApplicationStatus } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const CATEGORIES = ['Web', 'Mobile', 'Games', 'Desktop', 'API', 'E-commerce'];
const TECHNOLOGIES = ['React', 'Next.js', 'Vue', 'Angular', 'Node.js', 'Python', 'Django', 'Unity', 'Flutter', 'React Native', 'Java', 'C#'];
const NAMES = ['Juan', 'Maria', 'Carlos', 'Ana', 'Luis', 'Sofia', 'Pedro', 'Lucia', 'Miguel', 'Elena', 'Jorge', 'Laura', 'Esteban', 'Nina', 'Angel', 'Piero'];
const LAST_NAMES = ['Garcia', 'Rodriguez', 'Martinez', 'Lopez', 'Gonzalez', 'Perez', 'Sanchez', 'Ramirez', 'Torres', 'Flores', 'Arias', 'Aguilar', 'Alvares', 'Leandres'];

function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function main() {
  console.log('🌱 Empezando a generar datos de prueba...');

  // 1. Generar 250 clientes y 250 desarrolladores (total 500 usuarios)
  const users: any[] = [];
  
  for (let i = 0; i &lt; 250; i++) {
    const firstName = randomChoice(NAMES);
    const lastName = randomChoice(LAST_NAMES);
    const name = `${firstName} ${lastName}`;
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@example.com`;
    
    users.push({
      name,
      email,
      role: UserRole.CLIENT,
      bio: `Cliente buscando desarrolladores para proyectos de tecnología.`,
      certificates: null,
    });
  }
  
  for (let i = 0; i &lt; 250; i++) {
    const firstName = randomChoice(NAMES);
    const lastName = randomChoice(LAST_NAMES);
    const name = `${firstName} ${lastName}`;
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@dev.com`;
    
    users.push({
      name,
      email,
      role: UserRole.DEVELOPER,
      bio: `Desarrollador especializado en ${randomChoice(TECHNOLOGIES)}.`,
      certificates: `Certificado en ${randomChoice(TECHNOLOGIES)}, Certificado en ${randomChoice(TECHNOLOGIES)}`,
    });
  }

  console.log(`👤 Creando ${users.length} usuarios...`);
  const createdUsers = await Promise.all(
    users.map(user =&gt; prisma.user.create({ data: user }))
  );
  console.log(`✅ ${createdUsers.length} usuarios creados!`);

  // 2. Generar 100 proyectos
  const clients = createdUsers.filter(u =&gt; u.role === UserRole.CLIENT);
  const developers = createdUsers.filter(u =&gt; u.role === UserRole.DEVELOPER);
  const projects: any[] = [];

  for (let i = 0; i &lt; 100; i++) {
    const client = randomChoice(clients);
    const status = i &lt; 70 ? ProjectStatus.OPEN : randomChoice([ProjectStatus.IN_PROGRESS, ProjectStatus.COMPLETED, ProjectStatus.CANCELLED]);
    
    projects.push({
      title: `Proyecto ${randomChoice(CATEGORIES)} #${i + 1}`,
      description: `Descripción del proyecto: necesitamos una aplicación de ${randomChoice(CATEGORIES).toLowerCase()} con funcionalidades modernas.`,
      budget: randomChoice([500, 1000, 2000, 5000, 10000]),
      duration: `${randomChoice([1, 2, 3, 4, 8, 12])} ${randomChoice(['semanas', 'meses'])}`,
      category: randomChoice(CATEGORIES),
      technologies: `${randomChoice(TECHNOLOGIES)}, ${randomChoice(TECHNOLOGIES)}`,
      type: randomChoice([ProjectType.UNITARY, ProjectType.GROUP]),
      status,
      clientId: client.id,
      developerId: status !== ProjectStatus.OPEN ? randomChoice(developers).id : null,
      paymentMethod: randomChoice(['BCP', 'Visa', 'PayPal', 'Yape', 'Plin']),
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
    });
  }

  console.log(`📋 Creando ${projects.length} proyectos...`);
  const createdProjects = await Promise.all(
    projects.map(project =&gt; prisma.project.create({ data: project }))
  );
  console.log(`✅ ${createdProjects.length} proyectos creados!`);

  // 3. Generar postulaciones a proyectos abiertos
  const openProjects = createdProjects.filter(p =&gt; p.status === ProjectStatus.OPEN);
  const applications: any[] = [];

  for (const project of openProjects) {
    const numApplications = randomInt(1, 10);
    const selectedDevs = new Set&lt;string&gt;();

    for (let i = 0; i &lt; numApplications; i++) {
      let dev = randomChoice(developers);
      while (selectedDevs.has(dev.id)) {
        dev = randomChoice(developers);
      }
      selectedDevs.add(dev.id);

      applications.push({
        projectId: project.id,
        developerId: dev.id,
        reason: `Me interesa este proyecto porque tengo experiencia en ${randomChoice(TECHNOLOGIES)}.`,
        status: randomChoice([ApplicationStatus.PENDING, ApplicationStatus.ACCEPTED, ApplicationStatus.REJECTED]),
      });
    }
  }

  console.log(`📝 Creando ${applications.length} postulaciones...`);
  const createdApplications = await Promise.all(
    applications.map(app =&gt; prisma.application.create({ data: app }))
  );
  console.log(`✅ ${createdApplications.length} postulaciones creadas!`);

  // 4. Generar algunas reseñas
  const completedProjects = createdProjects.filter(p =&gt; p.status === ProjectStatus.COMPLETED &amp;&amp; p.developerId);
  const reviews: any[] = [];

  for (const project of completedProjects) {
    reviews.push({
      projectId: project.id,
      reviewerId: project.clientId,
      revieweeId: project.developerId!,
      stars: randomInt(3, 5),
      comment: `Excelente trabajo! Entregó a tiempo y la calidad es muy buena.`,
    });
  }

  console.log(`⭐ Creando ${reviews.length} reseñas...`);
  const createdReviews = await Promise.all(
    reviews.map(review =&gt; prisma.review.create({ data: review }))
  );
  console.log(`✅ ${createdReviews.length} reseñas creadas!`);

  console.log('\n🎉 Datos de prueba generados exitosamente!');
  console.log(`\n📊 Resumen:`);
  console.log(`- Usuarios: ${createdUsers.length}`);
  console.log(`- Proyectos: ${createdProjects.length}`);
  console.log(`- Postulaciones: ${createdApplications.length}`);
  console.log(`- Reseñas: ${createdReviews.length}`);
}

main()
  .catch((e) =&gt; {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () =&gt; {
    await prisma.$disconnect();
  });


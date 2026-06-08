
import { PrismaClient, UserRole, ProjectStatus, ProjectType, ApplicationStatus } from '@prisma/client';

const prisma = new PrismaClient();

// Variables configurables via entorno (o valores por defecto)
const NUM_CLIENTS = parseInt(process.env.NUM_CLIENTS || '250');
const NUM_DEVELOPERS = parseInt(process.env.NUM_DEVELOPERS || '250');
const NUM_PROJECTS = parseInt(process.env.NUM_PROJECTS || '100');
const MAX_APPLICATIONS_PER_PROJECT = parseInt(process.env.MAX_APPLICATIONS_PER_PROJECT || '10');

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

  // 1. Generar clientes y desarrolladores
  const users: any[] = [];
  
  console.log(`👤 Generando ${NUM_CLIENTS} clientes...`);
  for (let i = 0; i < NUM_CLIENTS; i++) {
    const firstName = randomChoice(NAMES);
    const lastName = randomChoice(LAST_NAMES);
    const name = `${firstName} ${lastName}`;
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${Date.now()}${i}@example.com`;
    
    users.push({
      name,
      email,
      role: UserRole.CLIENT,
      bio: `Cliente buscando desarrolladores para proyectos de tecnología.`,
      certificates: null,
    });
  }
  
  console.log(`👤 Generando ${NUM_DEVELOPERS} desarrolladores...`);
  for (let i = 0; i < NUM_DEVELOPERS; i++) {
    const firstName = randomChoice(NAMES);
    const lastName = randomChoice(LAST_NAMES);
    const name = `${firstName} ${lastName}`;
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${Date.now()}${i}@dev.com`;
    
    users.push({
      name,
      email,
      role: UserRole.DEVELOPER,
      bio: `Desarrollador especializado en ${randomChoice(TECHNOLOGIES)}.`,
      certificates: `Certificado en ${randomChoice(TECHNOLOGIES)}, Certificado en ${randomChoice(TECHNOLOGIES)}`,
    });
  }

  console.log(`📦 Insertando ${users.length} usuarios en BD...`);
  // Insertar en lotes para no saturar la BD
  const createdUsers: any[] = [];
  const BATCH_SIZE = 100;
  for (let i = 0; i < users.length; i += BATCH_SIZE) {
    const batch = users.slice(i, i + BATCH_SIZE);
    const created = await Promise.all(batch.map(user => prisma.user.create({ data: user })));
    createdUsers.push(...created);
    console.log(`  - Progreso: ${createdUsers.length}/${users.length}`);
  }
  console.log(`✅ ${createdUsers.length} usuarios creados!`);

  // 2. Generar proyectos
  const clients = createdUsers.filter(u => u.role === UserRole.CLIENT);
  const developers = createdUsers.filter(u => u.role === UserRole.DEVELOPER);
  const projects: any[] = [];

  console.log(`📋 Generando ${NUM_PROJECTS} proyectos...`);
  for (let i = 0; i < NUM_PROJECTS; i++) {
    const client = randomChoice(clients);
    const status = i < Math.floor(NUM_PROJECTS * 0.7) ? ProjectStatus.OPEN : randomChoice([ProjectStatus.IN_PROGRESS, ProjectStatus.COMPLETED, ProjectStatus.CANCELLED]);
    
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
      maxDevelopers: randomInt(1, 5),
      paymentMethod: randomChoice(['BCP', 'Visa', 'PayPal', 'Yape', 'Plin']),
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
    });
  }

  console.log(`📦 Insertando ${projects.length} proyectos...`);
  const createdProjects: any[] = [];
  for (let i = 0; i < projects.length; i += BATCH_SIZE) {
    const batch = projects.slice(i, i + BATCH_SIZE);
    const created = await Promise.all(batch.map(project => prisma.project.create({ data: project })));
    createdProjects.push(...created);
    console.log(`  - Progreso: ${createdProjects.length}/${projects.length}`);
  }
  console.log(`✅ ${createdProjects.length} proyectos creados!`);

  // 3. Generar postulaciones a proyectos abiertos
  const openProjects = createdProjects.filter(p => p.status === ProjectStatus.OPEN);
  const applications: any[] = [];

  console.log(`📝 Generando postulaciones...`);
  for (const project of openProjects) {
    const numApplications = randomInt(1, MAX_APPLICATIONS_PER_PROJECT);
    const selectedDevs = new Set<string>();

    for (let i = 0; i < numApplications; i++) {
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

  console.log(`📦 Insertando ${applications.length} postulaciones...`);
  const createdApplications: any[] = [];
  for (let i = 0; i < applications.length; i += BATCH_SIZE) {
    const batch = applications.slice(i, i + BATCH_SIZE);
    const created = await Promise.all(batch.map(app => prisma.application.create({ data: app })));
    createdApplications.push(...created);
    console.log(`  - Progreso: ${createdApplications.length}/${applications.length}`);
  }
  console.log(`✅ ${createdApplications.length} postulaciones creadas!`);

  // 4. Generar algunas reseñas
  const completedProjects = createdProjects.filter(p => p.status === ProjectStatus.COMPLETED && p.developerId);
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

  if (reviews.length > 0) {
    console.log(`⭐ Generando ${reviews.length} reseñas...`);
    const createdReviews = await Promise.all(reviews.map(review => prisma.review.create({ data: review })));
    console.log(`✅ ${createdReviews.length} reseñas creadas!`);
  }

  console.log('\n🎉 Datos de prueba generados exitosamente!');
  console.log(`\n📊 Resumen:`);
  console.log(`- Usuarios: ${createdUsers.length} (${NUM_CLIENTS} clientes, ${NUM_DEVELOPERS} desarrolladores)`);
  console.log(`- Proyectos: ${createdProjects.length}`);
  console.log(`- Postulaciones: ${createdApplications.length}`);
  console.log(`- Reseñas: ${reviews.length}`);
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

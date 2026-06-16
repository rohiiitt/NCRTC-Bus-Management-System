// src/lib/prisma.js
// Single shared Prisma instance for the whole app
// Like db.js in MelodyHub but no connect() needed — Prisma handles it

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
});

module.exports = prisma;

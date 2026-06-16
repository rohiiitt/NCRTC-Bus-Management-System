// src/controllers/notice.controller.js
// CMS = Content Management System — admin publishes notices to drivers

const prisma = require('../lib/prisma');

// GET /notices
// All published notices — with isRead flag for current user
async function getNotices(req, res) {
  try {
    const notices = await prisma.notice.findMany({
      where:   { publishAt: { lte: new Date() } },
      include: {
        reads:     { where: { userId: req.user.id } },
        createdBy: { select: { fullName: true } },
      },
      orderBy: { publishAt: 'desc' },
    });

    const result = notices.map((n) => ({
      id:        n.id,
      title:     n.title,
      body:      n.body,
      audience:  n.audience,
      publishAt: n.publishAt,
      createdBy: n.createdBy.fullName,
      isRead:    n.reads.length > 0,
      readAt:    n.reads[0]?.readAt || null,
    }));

    res.json({ notices: result });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
}

// GET /notices/:id  — single notice detail
async function getNoticeById(req, res) {
  try {
    const notice = await prisma.notice.findUnique({
      where:   { id: parseInt(req.params.id) },
      include: { createdBy: { select: { fullName: true } } },
    });

    if (!notice) return res.status(404).json({ message: 'Notice not found' });

    res.json({ notice });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
}

// POST /notices  — admin only
async function createNotice(req, res) {
  try {
    const { title, body, audience, publishAt } = req.body;

    if (!title || !body || !audience) {
      return res.status(400).json({ message: 'title, body and audience are required' });
    }

    const notice = await prisma.notice.create({
      data: {
        title,
        body,
        audience,
        publishAt:   publishAt ? new Date(publishAt) : new Date(),
        createdById: req.user.id,
      },
    });

    res.status(201).json({ message: 'Notice created', notice });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
}

// POST /notices/:id/read  — mark as read (upsert = safe to call multiple times)
async function markRead(req, res) {
  try {
    const noticeId = parseInt(req.params.id);
    const userId   = req.user.id;

    await prisma.noticeRead.upsert({
      where:  { noticeId_userId: { noticeId, userId } },
      update: {},
      create: { noticeId, userId },
    });

    res.json({ message: 'Marked as read' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
}

// GET /notices/:id/receipts  — admin sees who has/hasn't read
async function getReadReceipts(req, res) {
  try {
    const noticeId = parseInt(req.params.id);

    const notice = await prisma.notice.findUnique({
      where:   { id: noticeId },
      include: {
        reads: {
          include: {
            user: {
              select: { fullName: true, role: true, depot: { select: { name: true } } },
            },
          },
          orderBy: { readAt: 'desc' },
        },
      },
    });

    if (!notice) return res.status(404).json({ message: 'Notice not found' });

    res.json({
      notice:    { id: notice.id, title: notice.title, audience: notice.audience },
      readBy:    notice.reads,
      readCount: notice.reads.length,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
}

module.exports = { getNotices, getNoticeById, createNotice, markRead, getReadReceipts };

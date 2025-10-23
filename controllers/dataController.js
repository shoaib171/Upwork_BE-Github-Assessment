const mongoose = require('mongoose');

exports.listCollections = async (req, res) => {
  res.json(['organizations','repos','commits','issues','pulls','users']);
};

const modelMap = {
  organizations: require('../models/Organization'),
  repos: require('../models/Repo'),
  commits: require('../models/Commit'),
  issues: require('../models/Issue'),
  pulls: require('../models/Pull'),
  users: require('../models/User')
};

exports.queryCollection = async (req, res) => {
  const { collection } = req.params;
  const Model = modelMap[collection];
  if (!Model) return res.status(400).json({ error: 'invalid collection' });

  const page = Math.max(parseInt(req.query.page||'1'),1);
  const limit = Math.min(parseInt(req.query.limit||'50'), 1000);
  const skip = (page-1)*limit;

  let filter = {};
  if (req.query.filter) {
    try { filter = JSON.parse(req.query.filter); } catch(e){ filter = {}; }
  }

  let sort = {};
  if (req.query.sort) {
    const [f,dir] = req.query.sort.split(':');
    sort[f] = dir === 'desc' ? -1 : 1;
  } else {
    sort = { synced_at: -1 };
  }

  if (req.query.q) {
    const q = req.query.q;
    filter.$or = [
      { 'data.name': { $regex: q, $options: 'i' } },
      { 'data.full_name': { $regex: q, $options: 'i' } },
      { 'data.title': { $regex: q, $options: 'i' } }
    ];
  }

  const total = await Model.countDocuments(filter);
  const docs = await Model.find(filter).sort(sort).skip(skip).limit(limit).lean();
  res.json({ page, limit, total, docs });
};

import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const envData = {
    mongodbUriExists: !!process.env.MONGODB_URI,
    mongodbUriCluster: process.env.MONGODB_URI?.includes('aerosol') ? 'aerosol' : 'cluster0',
    allMongoKeys: Object.keys(process.env).filter(key => key.includes('MONGO')),
    nodeEnv: process.env.NODE_ENV,
  };

  res.status(200).json(envData);
} 
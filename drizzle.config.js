/** @type { import("drizzle-kit").Config } */

export default{
    schema: "./utils/schema.tsx", 
    dialect: 'postgresql', 
    dbCredentials: {
        url: 'postgresql://AIcontentGenerator_owner:I3RFY6XfUgZc@ep-noisy-glade-a1znutuj.ap-southeast-1.aws.neon.tech/AIcontentGenerator?sslmode=require'
    }
  };
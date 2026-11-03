const assertTransactionSupport = async (connection) => {
    const topology = await connection.db.admin().command({ hello: 1 });
    if (!topology.setName && topology.msg !== "isdbgrid") {
        throw new Error("MongoDB must support transactions; configure a replica set or sharded cluster");
    }
};

module.exports = { assertTransactionSupport };

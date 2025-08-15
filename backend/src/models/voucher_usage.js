const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const VoucherUsage = sequelize.define('VoucherUsage', {
  voucher_usage_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  voucher_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'voucher',
      key: 'voucher_id'
    }
  },
  job_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'job',
      key: 'job_id'
    }
  },
  used_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'voucher_usage',
  timestamps: false
});

VoucherUsage.removeAttribute('id');

// Defer associations to next tick to avoid circular require issues
setImmediate(() => {
  try {
    const Job = require('./job');
    const Voucher = require('./voucher');

    if (Voucher && typeof Voucher.hasMany === 'function') {
      Voucher.hasMany(VoucherUsage, { foreignKey: 'voucher_id' });
      VoucherUsage.belongsTo(Voucher, { foreignKey: 'voucher_id' });
    }

    if (Job && typeof Job.hasMany === 'function') {
      Job.hasMany(VoucherUsage, { foreignKey: 'job_id' });
      VoucherUsage.belongsTo(Job, { foreignKey: 'job_id' });
    }
  } catch (err) {
    // Log but don't crash — associations can be set later in a central place
    console.warn('voucher_usage: deferred association failed:', err.message);
  }
});

module.exports = VoucherUsage;

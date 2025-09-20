class Stats {
  constructor(data = {}) {
    this.totalShos = data.totalShos || 0;
    this.activeShos = data.activeShos || 0;
    this.recentAdded = data.recentAdded || 0;
    this.totalShosChange = data.totalShosChange || '+0%';
    this.activeShosChange = data.activeShosChange || '+0%';
    this.recentAddedChange = data.recentAddedChange || '+0%';
  }

  // Calculate stats from SHO data
  static calculateFromShos(shos) {
    const totalShos = shos.length;
    const activeShos = shos.filter(sho => sho.isActive !== false).length;
    const recentAdded = shos.filter(sho => {
      const createdDate = new Date(sho.createdAt);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return createdDate >= thirtyDaysAgo;
    }).length;

    return new Stats({
      totalShos,
      activeShos,
      recentAdded,
      totalShosChange: '+10%',
      activeShosChange: '-5%',
      recentAddedChange: '+20%'
    });
  }

  // Get formatted stats for display
  getFormattedStats() {
    return {
      totalShos: {
        value: this.totalShos,
        change: this.totalShosChange,
        label: 'Total SHOs'
      },
      activeShos: {
        value: this.activeShos,
        change: this.activeShosChange,
        label: 'Active SHOs'
      },
      recentAdded: {
        value: this.recentAdded,
        change: this.recentAddedChange,
        label: 'Recently Added'
      }
    };
  }
}

export default Stats;


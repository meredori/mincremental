import React from "react";
import "./linear.css";
import { getInitialState, handleIncrement, handleTick, handleUpgrade } from "./linearGameLogic.js";
import "./layouts/layouts.css";
import Tooltip from "../shared/Tooltip";

class LinearGame extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            ...getInitialState(),
            showPurchased: true
        };
        
        // Bind methods
        this.incrementScore = this.incrementScore.bind(this);
        this.purchaseUpgrade = this.purchaseUpgrade.bind(this);
        this.toggleShowPurchased = this.toggleShowPurchased.bind(this);
    }

    componentDidMount() {
        this.interval = setInterval(() => {
            this.setState(prevState => handleTick(prevState));
        }, this.state.timer);
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }

    incrementScore(x, i) {
        this.setState(prevState => handleIncrement(prevState, x, i));
    }

    purchaseUpgrade(upgradeId) {
        this.setState(prevState => handleUpgrade(prevState, upgradeId));
    }

    toggleShowPurchased = () => {
        this.setState(prevState => ({
            showPurchased: !prevState.showPurchased
        }));
    }

    getUpgradeMultiplier = (inc) => {
        if (!inc || !inc.id) return 1;
        
        const purchasedUpgrades = this.state.upgrades.filter(u =>
            u.purchased &&
            u.targetId === inc.id &&
            typeof u.multiplier === 'number'
        );
        
        if (purchasedUpgrades.length === 0) return 1;
        
        // Group upgrades by type
        const byType = purchasedUpgrades.reduce((acc, upgrade) => {
            const type = upgrade.type || 'efficiency';
            if (!acc[type]) acc[type] = [];
            acc[type].push(upgrade.multiplier || 0);
            return acc;
        }, {});

        // For each type, add the multipliers together, then multiply across types
        return Object.entries(byType).reduce((total, [type, multipliers]) => {
            const typeTotal = multipliers.reduce((sum, mult) => sum + mult, 0);
            return total * (1 + typeTotal);
        }, 1);
    }

    getIncrementerProduction = (inc) => {
        if (!inc) return 0;
        const baseProduction = (inc.owned || 0) * (inc.rate || 0);
        const multiplier = this.getUpgradeMultiplier(inc);
        return baseProduction * multiplier;
    }

    getTotalProduction = () => {
        const total = this.state.increment.reduce((sum, inc) => {
            const production = this.getIncrementerProduction(inc);
            return sum + (Number.isFinite(production) ? production : 0);
        }, 0);
        return Number.isFinite(total) ? total : 0;
    }

    getProductionPercentage = (inc) => {
        if (!inc) return 0;
        
        const incProduction = this.getIncrementerProduction(inc);
        const totalProduction = this.getTotalProduction();
        
        if (totalProduction === 0 || !Number.isFinite(totalProduction)) return 0;
        const percentage = (incProduction / totalProduction) * 100;
        return Number.isFinite(percentage) ? percentage : 0;
    }

    getUpgradeEffect = (upgrade) => {
        const targetInc = this.state.increment.find(inc => inc.id === upgrade.targetId);
        if (!targetInc) return { current: 0, new: 0, percentage: 0 };
        
        const currentProduction = this.getIncrementerProduction(targetInc);
        const newMultiplier = this.getUpgradeMultiplier(targetInc) * (1 + upgrade.multiplier);
        const newProduction = (targetInc.owned || 0) * (targetInc.rate || 0) * newMultiplier;
        return {
            current: currentProduction,
            new: newProduction,
            percentage: upgrade.multiplier * 100
        };
    }

    render() {
        return (
            <div className="game-linear layout-dashboard">
                <div className="dashboard-header">
                    <h2>Linear Ticker</h2>
                    <div className="dashboard-metrics">
                        <div className="metric-card">
                            <span className="metric-label">Total Resources</span>
                            <span className="metric-value">{Math.floor(this.state.score)}</span>
                        </div>
                        <div className="metric-card">
                            <span className="metric-label">Per Tick</span>
                            <span className="metric-value">
                                {Number.isFinite(this.getTotalProduction())
                                    ? this.getTotalProduction().toFixed(1)
                                    : '0.0'}
                            </span>
                        </div>
                        <div className="metric-card">
                            <span className="metric-label">Producers Owned</span>
                            <span className="metric-value">
                                {this.state.increment.reduce((sum, inc) => sum + (inc.owned || 0), 0)}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="dashboard-content">
                    <div className="dashboard-production">
                        <div className="tiers-grid dashboard-style">
                            {this.state.increment.map((inc, index) => (
                                <div key={index} className="tier-container dashboard">
                                    <Tooltip content={
                                        <div className="incrementer-tooltip">
                                            <div>Current: {Number.isFinite(this.getIncrementerProduction(inc))
                                                ? this.getIncrementerProduction(inc).toFixed(1)
                                                : '0.0'}/tick</div>
                                            <div>{Number.isFinite(this.getProductionPercentage(inc))
                                                ? this.getProductionPercentage(inc).toFixed(1)
                                                : '0.0'}% of total production</div>
                                            <div>Affected by: {
                                                this.state.upgrades
                                                    .filter(u => u.purchased && u.targetId === inc.id)
                                                    .map(u => u.name)
                                                    .join(', ') || 'No upgrades'
                                            }</div>
                                        </div>
                                    }>
                                        <div className="incrementer" onClick={() => this.incrementScore(inc)}>
                                            <div className="incrementer-header">
                                                <h3>{inc.name}</h3>
                                                <p className="incrementer-desc">{inc.description}</p>
                                            </div>
                                            <div className="incrementer-stats">
                                                <div className="stat-row">
                                                    <span className="stat-label">Owned:</span>
                                                    <span className="stat-value">{inc.owned || 0}</span>
                                                </div>
                                                <div className="stat-row">
                                                    <span className="stat-label">Producing:</span>
                                                    <span className="stat-value highlight">
                                                        {Number.isFinite(this.getIncrementerProduction(inc))
                                                            ? this.getIncrementerProduction(inc).toFixed(1)
                                                            : '0.0'}/tick
                                                    </span>
                                                </div>
                                                <div className="stat-row">
                                                    <span className="stat-label">Cost:</span>
                                                    <span className="stat-value cost">{inc.cost}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </Tooltip>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="dashboard-upgrades">
                        <div className="upgrades-header">
                            <h3>Upgrades</h3>
                            <label className="show-purchased">
                                <input
                                    type="checkbox"
                                    checked={this.state.showPurchased}
                                    onChange={this.toggleShowPurchased}
                                />
                                Show Purchased
                            </label>
                        </div>
                        <div className="upgrades-flex">
                            {this.state.upgrades
                                .filter(upgrade => this.state.showPurchased || !upgrade.purchased)
                                .map((upgrade, index) => (
                                    <div key={index} className={`upgrade-card ${upgrade.purchased ? 'purchased' : ''}`}>
                                        <Tooltip content={
                                            <div className="upgrade-tooltip">
                                                <div>{upgrade.description}</div>
                                                <div>Combines additively with other upgrades of the same type</div>
                                                {!upgrade.purchased && <div>
                                                    Production: {this.getUpgradeEffect(upgrade).current.toFixed(1)}
                                                    → {this.getUpgradeEffect(upgrade).new.toFixed(1)}
                                                </div>}
                                            </div>
                                        }>
                                            <button
                                                onClick={() => this.purchaseUpgrade(upgrade.id)}
                                                disabled={this.state.score < upgrade.cost || upgrade.purchased}
                                                className="upgrade-button"
                                            >
                                                <span className="upgrade-name">{upgrade.name}</span>
                                                <span className="upgrade-effect">
                                                    +{upgrade.multiplier * 100}% Production for {this.state.increment.find(inc => inc.id === upgrade.targetId)?.name || 'Unknown'}
                                                </span>
                                                <span className="upgrade-cost">Cost: {upgrade.cost}</span>
                                            </button>
                                        </Tooltip>
                                    </div>
                                ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default LinearGame;
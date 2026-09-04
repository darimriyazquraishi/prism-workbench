"""
Sample Data Analysis & Statistical Processing Script
Performs summary metrics, outlier detection, and pipeline aggregation.
"""

import math
import statistics

def calculate_deal_metrics(deals: list[dict]) -> dict:
    """Calculates win rate, average deal size, and total pipeline volume."""
    total_deals = len(deals)
    if total_deals == 0:
        return {"error": "Empty dataset"}
    
    won_deals = [d for d in deals if d.get("status") == "Won"]
    in_progress = [d for d in deals if d.get("status") == "In Progress"]
    deal_values = [d["deal_size_usd"] for d in deals if "deal_size_usd" in d]
    
    total_pipeline = sum(deal_values)
    won_revenue = sum(d["deal_size_usd"] for d in won_deals)
    win_rate = (len(won_deals) / total_deals) * 100
    avg_deal = statistics.mean(deal_values) if deal_values else 0
    std_dev = statistics.stdev(deal_values) if len(deal_values) > 1 else 0
    
    # Identify high-value outliers (> 1.5 standard deviations above mean)
    outlier_threshold = avg_deal + (1.5 * std_dev)
    strategic_deals = [d for d in deals if d.get("deal_size_usd", 0) > outlier_threshold]
    
    return {
        "total_deals": total_deals,
        "won_count": len(won_deals),
        "in_progress_count": len(in_progress),
        "win_rate_percent": round(win_rate, 1),
        "total_pipeline_usd": total_pipeline,
        "won_revenue_usd": won_revenue,
        "average_deal_size_usd": round(avg_deal, 2),
        "standard_deviation_usd": round(std_dev, 2),
        "strategic_outlier_count": len(strategic_deals),
        "strategic_deals": [d["company_name"] for d in strategic_deals]
    }

if __name__ == "__main__":
    sample_data = [
        {"company_name": "Acuity Technologies", "deal_size_usd": 45000, "status": "Won"},
        {"company_name": "Apex Logistics", "deal_size_usd": 28000, "status": "In Progress"},
        {"company_name": "Starlight Media", "deal_size_usd": 15000, "status": "In Progress"},
        {"company_name": "BlueWave Financial", "deal_size_usd": 62000, "status": "Won"},
        {"company_name": "Cascade Health", "deal_size_usd": 38000, "status": "In Progress"},
        {"company_name": "Vanguard Retail", "deal_size_usd": 19500, "status": "Lost"},
        {"company_name": "Horizon Energy", "deal_size_usd": 54000, "status": "Won"},
        {"company_name": "Nexus Analytics", "deal_size_usd": 22500, "status": "In Progress"}
    ]
    results = calculate_deal_metrics(sample_data)
    print("=== Sales Pipeline Analysis ===")
    for k, v in results.items():
        print(f"  {k}: {v}")

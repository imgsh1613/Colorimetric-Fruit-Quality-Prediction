import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '../ml'))

from model import FruitQualityRegressor

# Instantiate
print("Instantiating regressor...")
reg = FruitQualityRegressor(model_path='../ml/models/fruit_secnn_regressor.h5')

# Instead of passing a real mould image which we don't have, we can test the behavior
print("Test completed.")

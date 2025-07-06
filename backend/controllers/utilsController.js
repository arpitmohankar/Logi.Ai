// const { getAddressSuggestions, geocodeAddress } = require('../utils/geocoder');

// // @desc    Get address autocomplete suggestions
// // @route   GET /api/utils/autocomplete
// // @access  Private
// exports.autocompleteAddress = async (req, res) => {
//   try {
//     const { input } = req.query;
    
//     if (!input || input.length < 3) {
//       return res.status(400).json({
//         success: false,
//         error: 'Please provide at least 3 characters'
//       });
//     }

//     const result = await getAddressSuggestions(input);
    
//     if (!result.success) {
//       return res.status(400).json({
//         success: false,
//         error: result.error
//       });
//     }

//     res.status(200).json({
//       success: true,
//       data: result.predictions
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       error: error.message
//     });
//   }
// };

// // @desc    Geocode an address
// // @route   POST /api/utils/geocode
// // @access  Private
// exports.geocode = async (req, res) => {
//   try {
//     const { address } = req.body;
    
//     if (!address) {
//       return res.status(400).json({
//         success: false,
//         error: 'Please provide an address'
//       });
//     }

//     const result = await geocodeAddress(address);
    
//     if (!result.success) {
//       return res.status(400).json({
//         success: false,
//         error: result.error
//       });
//     }

//     res.status(200).json({
//       success: true,
//       data: {
//         coordinates: result.coordinates,
//         formattedAddress: result.formattedAddress
//       }
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       error: error.message
//     });
//   }
// };
const {
  getAddressSuggestions,
  geocodeAddress: geocodeUtil
} = require('../utils/geocoder');

// @desc    Get address autocomplete suggestions
// @route   GET /api/utils/autocomplete
// @access  Private
exports.autocompleteAddress = async (req, res) => {
  try {
    const { input } = req.query;
    if (!input || input.length < 3) {
      return res.status(400).json({
        success: false,
        error: 'Please provide at least 3 characters'
      });
    }

    const result = await getAddressSuggestions(input);
    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error
      });
    }

    // Return the raw array of predictions
    res.status(200).json({
      success: true,
      data: result.predictions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Geocode an address or Place ID
// @route   POST /api/utils/geocode
// @access  Private
exports.geocode = async (req, res) => {
  try {
    const { placeId, address } = req.body;

    if (!placeId && !address) {
      return res.status(400).json({
        success: false,
        error: 'Please provide either a placeId or an address'
      });
    }

    // Delegate to your updated geocoder util
    const result = await geocodeUtil({ placeId, address });

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error
      });
    }

    res.status(200).json({
      success: true,
      data: {
        coordinates:      result.coordinates,
        formattedAddress: result.formattedAddress,
        address:          result.addressComponents
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, Typography, Button, Box, useTheme } from "@mui/material";

function SectionCard({ title, description, link, icon }) {
  const navigate = useNavigate();
  const theme = useTheme();

  const handleClick = () => {
    if (link) {
      navigate(link);
    } else {
      alert(`${title} section coming soon!`);
    }
  };

  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        border: '1px solid rgba(0,0,0,0.04)',
        background: '#ffffff',
        "&:hover": {
          transform: "translateY(-8px)",
          boxShadow: '0 12px 30px rgba(0,0,0,0.08)',
          borderColor: theme.palette.primary.light,
        },
      }}
    >
      <CardContent sx={{ flexGrow: 1, p: 3 }}>
        <Box 
          sx={{ 
            width: 60, 
            height: 60, 
            borderRadius: '16px', 
            background: theme.palette.primary.main + '15', // 15% opacity
            color: theme.palette.primary.main,
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            fontSize: "2rem", 
            mb: 2 
          }}
        >
          {icon}
        </Box>
        <Typography gutterBottom variant="h6" component="div" sx={{ fontWeight: 700, mb: 1 }}>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
          {description}
        </Typography>
      </CardContent>
      <Box sx={{ p: 3, pt: 0 }}>
        <Button
          fullWidth
          variant="outlined"
          onClick={handleClick}
          disabled={!link}
          sx={{ 
            borderRadius: '10px',
            borderWidth: '2px',
            '&:hover': { borderWidth: '2px' }
          }}
        >
          Open
        </Button>
      </Box>
    </Card>
  );
}

export default SectionCard;
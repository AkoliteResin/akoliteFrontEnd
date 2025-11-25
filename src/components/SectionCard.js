import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, Typography, Button, Box } from "@mui/material";

function SectionCard({ title, description, link, icon }) {
  const navigate = useNavigate();

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
        transition: "transform 0.3s, box-shadow 0.3s",
        "&:hover": {
          transform: "translateY(-5px)",
          boxShadow: 6, // Elevation level 6
        },
      }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h2" sx={{ fontSize: "3rem", mb: 2 }}>
          {icon}
        </Typography>
        <Typography gutterBottom variant="h5" component="div">
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      </CardContent>
      <Box sx={{ p: 2 }}>
        <Button
          fullWidth
          variant="contained"
          onClick={handleClick}
          disabled={!link}
        >
          Open
        </Button>
      </Box>
    </Card>
  );
}

export default SectionCard;